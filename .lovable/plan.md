# Multi-warehouse & multi-outlet support

Scope: full system across both grocery (products) and food (restaurants), covering CRUD, per-location stock, nearest-location routing on checkout, and multiple outlets per partner.

## 1. Data model (new tables + columns)

**Grocery side**
- `warehouses` — name, code, address, city, pincode, lat, lng, is_active, sort_order
- `warehouse_pincodes` — warehouse_id, pincode (which pincodes each warehouse serves)
- `product_stock` — warehouse_id, product_id, qty, low_stock_threshold (unique on pair)
- `orders` → add `warehouse_id` (nullable, set on checkout)

**Food side**
- `partner_outlets` — restaurant_id, name, address, area, pincode, lat, lng, eta_mins, is_open, is_active
- `partner_dishes` → add `outlet_id` nullable (null = available at all outlets of that restaurant)
- `orders` → add `outlet_id` nullable

All tables: RLS on. Admin full access. Owners can manage outlets of restaurants they own (reuse `owns_restaurant`). Public read for active rows.

## 2. Server functions

`src/lib/warehouses.functions.ts` (admin)
- listWarehouses / saveWarehouse / deleteWarehouse
- setWarehousePincodes
- listProductStock(warehouseId) / setProductStock

`src/lib/outlets.functions.ts` (partner + admin)
- listMyOutlets / saveOutlet / deleteOutlet (owner-scoped)
- adminListOutlets

`src/lib/fulfillment.functions.ts` (public, used at checkout)
- resolveWarehouseForPincode(pincode) → returns best warehouse + serviceable boolean
- resolveOutletForRestaurant(restaurantId, pincode) → nearest active outlet

## 3. Checkout integration
- Grocery checkout: before placing order, call `resolveWarehouseForPincode`. If none serviceable → block with "We don't deliver here yet". Otherwise stamp `warehouse_id` on order and decrement `product_stock` in a transaction (DB function `place_grocery_order`).
- Food checkout: call `resolveOutletForRestaurant`, stamp `outlet_id`.

## 4. Admin UI
- New route `/admin/warehouses` — table + create/edit dialog, pincode chips, stock sub-table per warehouse.
- `/admin/restaurants` row expansion → add "Outlets" tab listing outlets for that restaurant.
- Sidebar entry "Warehouses".

## 5. Partner UI
- New route `/partner/outlets` — owner manages outlets (name, address, pincode, lat/lng, ETA, open/closed).
- Partner nav gets "Outlets" link.
- Dish form gains optional outlet picker (defaults to "All outlets").

## 6. Public surfaces
- Product page / cart shows "Delivered from <warehouse>, ETA …" once pincode known.
- Restaurant page picks nearest outlet for ETA + distance.

## 7. Order routing notifications
- `notify_restaurant_on_order` trigger updated to also notify the outlet owner channel (same owner, but include outlet name in body).

## Technical notes
- Distance: simple Haversine in SQL (or app-side) when lat/lng present; fallback to pincode-list match.
- Stock decrement uses a `security definer` Postgres function to keep it atomic and bypass RLS safely; rejects if any line goes negative.
- `partner_restaurants.area / eta_mins / distance_km` become derived from the chosen outlet at query time; the columns remain for the restaurant-level default/fallback.
- No data migration needed: existing restaurants work with zero outlets (system falls back to restaurant-level fields). Existing products work with no stock rows (treated as in stock, no warehouse) until admin sets up warehouses.

## Rollout order
1. Migration (warehouses, outlets, stock, order columns, RLS, helper SQL fns)
2. Server functions
3. Admin warehouse UI + outlet tab
4. Partner outlets UI
5. Checkout integration (grocery + food)
6. Public display tweaks

Note on hosting: project is TanStack Start (React/TS). Reminder per saved memory — Hostinger/PHP target would require a separate port; this build stays on the current stack.
