-- Phase 5 — coupon parity + warehouse profile lookup.
SET NAMES utf8mb4;

-- Extend coupons to match cloud schema
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS usage_limit    INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS per_user_limit INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS used_count     INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valid_from     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS valid_until    DATETIME DEFAULT NULL;

-- Backfill used_count from redemptions if the table exists
-- (safe no-op if coupon_redemptions doesn't exist yet)
