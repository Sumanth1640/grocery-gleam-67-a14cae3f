-- Phase 13: Promotional & personalized notification dedup log
-- Tracks "we already sent push X to user Y in window Z" so the cron can
-- run every 15 minutes without spamming customers.

CREATE TABLE IF NOT EXISTS promo_notification_log (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     CHAR(36)     NOT NULL,
  kind        VARCHAR(32)  NOT NULL,   -- 'coupon' | 'surge' | 'wishlist' | 'recommend' | 'mealtime'
  ref_key     VARCHAR(160) NOT NULL,   -- coupon_id / pincode / product_id / 'breakfast-2026-06-25' etc.
  sent_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_kind_ref (user_id, kind, ref_key),
  INDEX idx_sent (sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
