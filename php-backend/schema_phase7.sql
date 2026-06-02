-- ============================================================
-- Phase 7 — Order status parity (add 'packed' and 'ready')
-- Run this once after phase4/phase6.
-- ============================================================

ALTER TABLE orders
  MODIFY COLUMN status
    ENUM('placed','accepted','preparing','packed','ready','out_for_delivery','delivered','cancelled')
    NOT NULL DEFAULT 'placed';
