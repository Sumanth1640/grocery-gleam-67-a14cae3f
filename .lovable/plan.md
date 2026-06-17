# Port Rider Features to PHP (Hostinger)

Bring the rider/delivery system to feature parity in the PHP backend so the Hostinger build has working rider signup, admin approval, assignment, earnings, payouts, and customer tracking.

## 1. Database — `schema_phase11.sql`

New / extended MySQL tables (mirroring the Supabase schema you already have):

- `riders` — user_id, full_name, phone, vehicle_type, vehicle_number, license_no, status (pending/approved/rejected/suspended), is_online, current_lat/lng, created_at
- `rider_outlets` — rider_id, outlet_id  *(coverage)*
- `rider_pincodes` — rider_id, pincode
- `order_assignments` — order_id, rider_id, status (assigned/picked_up/delivered/cancelled), assigned_at, picked_up_at, delivered_at, notes
- `rider_earnings` — rider_id, order_id (unique), base_fee, total, status (pending/paid), earned_at, paid_at, payout_id
- `rider_payouts` — rider_id, amount, period_start, period_end, status, paid_at, note
- `app_settings` — key, value  *(seed `rider_flat_fee = 40`)*

Plus a `pending_preferred_outlets` / `pending_preferred_pincodes` column on `riders` (JSON) so admin can see requested coverage before approval, matching the Cloud flow.

## 2. PHP API endpoints under `php-backend/api/rider/` and `php-backend/api/admin/`

**Rider self-service**
- `POST  /api/rider/apply` — submit application with preferred outlets + pincodes
- `GET   /api/rider/me` — current rider profile + status
- `POST  /api/rider/online` — toggle online
- `GET   /api/rider/assignments` — my active + recent assignments
- `POST  /api/rider/assignments/update` — picked_up / delivered (triggers earning)
- `GET   /api/rider/earnings` — today / week / month + recent rows
- `GET   /api/rider/outlets-for-signup` — list active outlets

**Outlet manager**
- `GET   /api/outlet/riders/available?outlet_id=&pincode=` — ranked list (pincode match → lowest active load), returns `best_match` flag
- `POST  /api/outlet/orders/assign-rider` — create assignment

**Admin**
- `GET   /api/admin/riders?status=` — list with requested coverage
- `POST  /api/admin/riders/decide` — approve/reject (on approve, copy preferred coverage into `rider_outlets`/`rider_pincodes` if empty)
- `GET   /api/admin/payouts/pending` — grouped by rider
- `POST  /api/admin/payouts/process` — mark earnings paid + create payout row
- `GET   /api/admin/settings/rider-fee` / `POST` to update flat fee

**Customer**
- `GET   /api/orders/{id}/rider` — rider name, phone, vehicle (only when status = out_for_delivery)

Earnings are inserted automatically inside the "mark delivered" handler (PHP equivalent of the trigger), reading the flat fee from `app_settings`.

## 3. Helpers

`php-backend/rider_helpers.php` — `rank_riders()`, `record_rider_earning()`, `assert_rider_owns_assignment()`, plus auth helpers for `rider`/`outlet_manager`/`admin` roles (reuse existing `partner_helpers.php` patterns).

## 4. Frontend wiring (`src/lib/dual-api.ts` + `src/lib/php-api/index.ts`)

Add a `rider` namespace to `php` with one method per endpoint above, then add `dualApi.rider.*` methods that branch on `USE_PHP` between the existing TanStack server fns and the new PHP calls. Update these route files to call `dualApi.rider.*` instead of importing server fns directly:

- `src/routes/_authenticated/rider.tsx`
- `src/routes/_authenticated/admin/riders.tsx`
- `src/routes/_authenticated/admin/payouts.tsx`
- `src/routes/_authenticated/outlet/orders.tsx` (rider list + assign)
- `src/routes/_authenticated/orders.$id.tsx` (customer rider card)

Realtime: PHP has no websockets — fall back to a 15s `refetchInterval` on the customer rider card and rider dashboard when `USE_PHP`.

## 5. Docs

Append a "Phase 11 — Rider system" section to `HOSTINGER_DEPLOY.md` listing `schema_phase11.sql` in the import order and noting the polling fallback.

## Technical notes

- Auth: reuse the existing JWT middleware; role checks via the same pattern as `partner` endpoints.
- Earnings trigger replacement: call `record_rider_earning($rider_id,$order_id)` inside the "delivered" handler, using `INSERT IGNORE` on `(order_id)` for idempotency.
- Nearest-rider ranking is done in PHP (pincode match boolean, then active-assignment count `ASC`), no geo math needed for v1 — matches current Cloud behavior.
- Push notifications were already skipped, so nothing to port there.

## Out of scope

- Live GPS streaming for the rider (no realtime channel on shared hosting).
- iOS/Android push.
