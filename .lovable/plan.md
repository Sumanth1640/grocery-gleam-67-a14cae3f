## Goal

Mirror the warehouse-manager pattern for restaurants: each outlet of a restaurant can have its own manager/cashier. The restaurant owner (partner) assigns managers per outlet from their partner panel. Each assigned manager logs in and sees a dedicated **Outlet Manager panel** scoped to only the outlets they manage — orders, menu availability toggles, and basic outlet ops — without seeing the whole restaurant.

## What changes

### 1. Database (migration)

- New table `partner_outlet_managers`
  - `id`, `outlet_id` (→ partner_outlets), `user_id` (→ auth user), `restaurant_id` (denormalized for fast RLS), `role` ('manager' | 'cashier'), `created_at`
  - Unique `(outlet_id, user_id)`
  - RLS:
    - Restaurant owner can full-manage rows where they own the restaurant (uses existing `owns_restaurant`).
    - Manager can `SELECT` their own rows.
    - Admin full access.
- Security-definer helpers:
  - `manages_outlet(_user_id uuid, _outlet_id uuid) returns boolean`
  - `is_outlet_manager(_user_id uuid) returns boolean`
- Extend RLS on existing tables so outlet managers can do their job:
  - `orders`: SELECT + UPDATE when `outlet_id` matches a row in `partner_outlet_managers` for `auth.uid()`.
  - `partner_dishes`: UPDATE (availability/stock toggle) when `outlet_id` matches their managed outlets, scoped to that outlet only.
  - `order_assignments`: SELECT when the underlying order belongs to a managed outlet.
- New notification trigger `notify_outlet_managers_on_order` — inserts a notification for every manager of `NEW.outlet_id` (alongside existing owner notification).

### 2. Server functions (`src/lib/outlet-managers.functions.ts`, new)

Owner-side (uses `requireSupabaseAuth`, gated by `owns_restaurant`):
- `listOutletManagers({ restaurant_id })`
- `addOutletManager({ outlet_id, email, role })` — looks up user by email via `supabaseAdmin`, inserts row.
- `removeOutletManager({ id })`

Manager-side:
- `listMyManagedOutlets()` — returns outlets the current user manages (with restaurant name).
- `listOutletOrders({ outlet_id })` — orders for an outlet they manage.
- `updateOutletOrderStatus({ order_id, status })`.

### 3. Partner panel UI

- New route `src/routes/_authenticated/partner/outlet-managers.tsx`
  - Per restaurant → list outlets → per outlet show assigned managers, "Add manager by email" form, remove button.
- Add link in partner sidebar / `partner/outlets.tsx`.

### 4. New "Outlet" panel (separate from partner/admin/warehouse)

- New layout `src/routes/_authenticated/outlet.tsx` — gated by `is_outlet_manager` check; redirects elsewhere if not.
- Pages:
  - `outlet/index.tsx` — outlet picker (if user manages multiple) + today's stats.
  - `outlet/orders.tsx` — live order list with status update (accept / prepare / ready / out for delivery), reusing the existing `OrderAlerts` sound component.
  - `outlet/menu.tsx` — toggle dish availability / in-stock for that outlet's dishes only.
- Add post-login routing: if user is outlet-manager-only, land them on `/outlet`.

### 5. Header/menu adjustments

- Add an "Outlet panel" entry in the user dropdown when `is_outlet_manager()` returns true (similar to existing partner/admin entries).
- Block customer-only routes the same way warehouse managers are handled in `__root.tsx`, if needed.

## Technical notes

- Email lookup for "add manager" uses `supabaseAdmin.auth.admin.listUsers` filtered by email (same pattern used in `warehouse-managers.functions.ts` — will mirror that file).
- All new RLS uses security-definer helpers — no recursive policies.
- Realtime: add `partner_outlet_managers` and ensure `orders` is already in `supabase_realtime` publication so the outlet panel can subscribe to new orders for their outlet.
- Existing owner notifications stay; outlet-manager notifications are additive.

## Out of scope (ask later if needed)

- Payout/revenue splitting per outlet.
- Cashier-specific permissions distinct from manager (role column is stored but treated equally for now).
- Inviting users who don't yet have an account (today they must sign up first, same as warehouse managers).

Shall I proceed?
