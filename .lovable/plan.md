Build out the remaining rider/delivery features in order, one focused migration + code pass per feature.

## 1. Rider signup — preferred outlets/pincodes
- Extend `src/components/native/MobileLogin.tsx` (or the rider signup step) with a multi-select of active outlets and a pincode chip input.
- Save into existing `riders.preferred_outlets` / `riders.preferred_pincodes` columns at signup.
- Surface these on the admin approval screen so admins can one-click copy preferred → actual coverage when approving.

## 2. Capacitor push notifications (background)
- Add `@capacitor/push-notifications`.
- New table `device_tokens (user_id, token, platform)` + GRANTs + RLS (user manages own).
- New server fn `registerDeviceToken` called from rider app on login.
- Extend `notify_rider_on_assignment` trigger path: after insert into `notifications`, also enqueue a push via an edge function that uses FCM (requires `FCM_SERVER_KEY` secret — will request from user when we get here).
- Rider route registers token + listeners; foreground still uses existing chime.

## 3. Auto-suggest nearest rider by pincode
- In `outletListAvailableRiders`, accept optional `deliveryPincode`.
- Rank: (a) rider linked to outlet AND serves that pincode, (b) rider linked to outlet, (c) others — then by active load asc.
- Pass order's delivery pincode from the assign sheet; show a "⭐ Best match" badge on top rider.

## 4. Rider earnings / payouts
- New tables:
  - `rider_earnings (rider_id, order_id, base_fee, distance_fee, tip, total, status: pending|paid, earned_at)`
  - `rider_payouts (rider_id, amount, period_start, period_end, status, paid_at, notes)`
- GRANTs + RLS: rider sees own; admin sees all.
- Trigger on `orders` status → `delivered` inserts an earnings row using a configurable per-order base fee (start with flat ₹40, store in `app_settings` or hardcode constant).
- Rider route: new "Earnings" tab showing today / week / month totals + recent deliveries.
- Admin route `src/routes/_authenticated/admin/payouts.tsx`: list pending earnings per rider, "Mark paid" → creates payout + flips earnings.

## 5. Live order status for customers
- Customer order detail page already shows status; add a timeline component (Placed → Confirmed → Preparing → Out for delivery → Delivered) driven by `orders.status` + `order_assignments`.
- Subscribe via Supabase realtime on the customer's `orders` row + assignment row so the UI updates without refresh.
- Show assigned rider's name, vehicle, and phone (tap to call) once status is `out_for_delivery`.

## Order of work
I'll ship #1 → #5 sequentially, each with its own migration if needed, types regen, and UI wiring. After each one I'll confirm before moving on so you can test and redirect.

## Things I'll ask before starting a step
- **#2 Push**: needs an FCM (Android) / APNs setup. I'll request `FCM_SERVER_KEY` + ask whether iOS is in scope before building.
- **#4 Earnings**: confirm flat fee vs distance-based, and whether tips are in scope now.

Starting with **#1 (rider signup preferred areas)** as soon as you approve this plan.
