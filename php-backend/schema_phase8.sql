-- ============================================================
-- Phase 8 — Repair existing grocery orders missing warehouse_id
-- Run this once after uploading the PHP fixes.
-- ============================================================

UPDATE orders o
JOIN warehouse_pincodes wp
  ON REPLACE(TRIM(wp.pincode), ' ', '') = REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(o.address, '$.pincode'))), ' ', '')
JOIN warehouses w
  ON w.id = wp.warehouse_id AND w.is_active = 1
SET o.warehouse_id = w.id
WHERE o.warehouse_id IS NULL
  AND o.restaurant_id IS NULL;

UPDATE orders o
JOIN warehouses w
  ON REPLACE(TRIM(w.pincode), ' ', '') = REPLACE(TRIM(JSON_UNQUOTE(JSON_EXTRACT(o.address, '$.pincode'))), ' ', '')
 AND w.is_active = 1
SET o.warehouse_id = w.id
WHERE o.warehouse_id IS NULL
  AND o.restaurant_id IS NULL;
