-- ============================================================
-- Phase 6 — Restaurant partner & outlet manager parity
-- ============================================================

-- Orders need outlet_id to attribute to a specific outlet manager
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS outlet_id CHAR(36) DEFAULT NULL AFTER restaurant_id,
  ADD INDEX IF NOT EXISTS idx_orders_outlet (outlet_id);

-- Some installs of MySQL < 8.0.29 don't support "IF NOT EXISTS" on ADD COLUMN.
-- If the above errors there, run manually:
--   ALTER TABLE orders ADD COLUMN outlet_id CHAR(36) DEFAULT NULL AFTER restaurant_id;
--   ALTER TABLE orders ADD INDEX idx_orders_outlet (outlet_id);
