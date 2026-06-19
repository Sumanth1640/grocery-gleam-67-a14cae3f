-- Phase 12: delivery proof photo for rider assignments.
-- Run after schema_phase11.sql.

ALTER TABLE order_assignments
  ADD COLUMN IF NOT EXISTS proof_photo VARCHAR(500) NULL AFTER delivered_at;
