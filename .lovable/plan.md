# PHP parity for Admin / Warehouse / Restaurant Partner

You asked for full PHP parity across all three surfaces. That's 90+ server functions today, plus 14 new MySQL tables, role enforcement, signed file URLs, and rewiring ~30 React pages. I'll deliver in 4 phases so each phase is reviewable and ships working features.

## Phase 1 — Foundation (this turn)

**MySQL schema (`php-backend/schema_phase4.sql`)** — adds:
- `user_roles` (admin / moderator / user) + seed helper
- `warehouses`, `warehouse_pincodes`, `warehouse_managers`, `product_stock`
- `partner_restaurants`, `partner_outlets`, `partner_outlet_managers`, `partner_dishes`, `partner_dish_variants`, `partner_dish_addons`
- `banners`, `riders`, `refund_requests`, `order_assignments`, `coupon_redemptions`
- `ALTER orders` to add `warehouse_id`, `outlet_id`, `restaurant_id`, `razorpay_order_id`, `razorpay_payment_id`, `payment_status`

**PHP helpers (`config.php`)** — add `has_role()`, `require_admin()`, `manages_warehouse()`, `owns_restaurant()`, `manages_outlet()`, `require_admin_or_warehouse_manager()`.

## Phase 2 — Admin endpoints + wiring (this turn if room, else next)

`php-backend/api/admin/*.php` (~30 files): stats, products CRUD, categories CRUD, orders list/update, banners CRUD, customers list/block, refunds, riders + assignments, low-stock + reorder, restaurants approve/block/docs, analytics, settlements, reports, team (grant/revoke admin, warehouse mapping).

Then add `php.admin.*` methods in `src/lib/php-api/index.ts` and switch each `/admin/*` route to `useDualFn(...)`.

## Phase 3 — Warehouse manager (warehouses CRUD, pincodes, stock, my warehouses, outlet pages)
~12 endpoints + wire `/_authenticated/outlet/*` routes.

## Phase 4 — Restaurant partner (onboarding, dishes, outlets, outlet managers, orders, payouts, dashboard)
~25 endpoints + wire `/_authenticated/partner/*` and `/_authenticated/outlet/*` routes.

## Technical notes

- **Role check**: mirrors Supabase exactly — `SELECT 1 FROM user_roles WHERE user_id=? AND role='admin'`. `require_admin()` throws 403 on miss.
- **Auth model unchanged**: existing JWT issued by `auth/login.php` already carries `sub` (user id). Helpers read that, then check role tables.
- **First admin**: I'll add a one-line SQL snippet in the schema file showing how to grant yourself admin: `INSERT INTO user_roles (id, user_id, role) VALUES (UUID(), '<your-user-id>', 'admin');`
- **Signed file URLs**: Supabase storage signed URLs become simple authenticated file proxy `php-backend/api/admin/doc_url.php` returning a short-lived token URL.
- **Razorpay / partner docs**: schema adds the columns, but Razorpay verify and partner doc upload remain Cloud-only until you decide on a PHP storage strategy (local filesystem vs S3). I'll flag where this matters.

## After approval

I'll execute Phase 1 (schema + helpers) plus begin Phase 2 (admin endpoints) in the same turn, then continue in follow-up turns.
