-- =========================================================
-- Phase 11 — Rider self-service, coverage, earnings, payouts
-- Run once on your Hostinger MySQL DB after the previous phases.
-- =========================================================

-- Extend riders for self-service signup + approval workflow.
ALTER TABLE riders
  ADD COLUMN IF NOT EXISTS user_id CHAR(36) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'approved' AFTER notes,
  ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(300) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS preferred_outlets JSON NULL AFTER rejection_reason,
  ADD COLUMN IF NOT EXISTS preferred_pincodes JSON NULL AFTER preferred_outlets,
  ADD UNIQUE INDEX IF NOT EXISTS uniq_rider_user (user_id);

-- Rider <-> outlet coverage
CREATE TABLE IF NOT EXISTS rider_outlets (
  rider_id  CHAR(36) NOT NULL,
  outlet_id CHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rider_id, outlet_id),
  INDEX idx_outlet (outlet_id),
  FOREIGN KEY (rider_id)  REFERENCES riders(id)          ON DELETE CASCADE,
  FOREIGN KEY (outlet_id) REFERENCES partner_outlets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rider <-> pincode coverage (for product/warehouse deliveries + ranking)
CREATE TABLE IF NOT EXISTS rider_pincodes (
  rider_id CHAR(36) NOT NULL,
  pincode  VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (rider_id, pincode),
  INDEX idx_pin (pincode),
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- App-level settings (rider_flat_fee, etc.)
CREATE TABLE IF NOT EXISTS app_settings (
  `key`      VARCHAR(120) PRIMARY KEY,
  `value`    TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO app_settings (`key`, `value`) VALUES ('rider_flat_fee', '40')
  ON DUPLICATE KEY UPDATE `key` = `key`;

-- Payouts (one row per pay-out batch)
CREATE TABLE IF NOT EXISTS rider_payouts (
  id           CHAR(36) PRIMARY KEY,
  rider_id     CHAR(36) NOT NULL,
  amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  period_start TIMESTAMP NULL,
  period_end   TIMESTAMP NULL,
  status       ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'paid',
  paid_at      TIMESTAMP NULL DEFAULT NULL,
  notes        TEXT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rider (rider_id),
  FOREIGN KEY (rider_id) REFERENCES riders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-delivery earnings (one row per delivered order)
CREATE TABLE IF NOT EXISTS rider_earnings (
  id         CHAR(36) PRIMARY KEY,
  rider_id   CHAR(36) NOT NULL,
  order_id   CHAR(36) NOT NULL,
  base_fee   DECIMAL(10,2) NOT NULL DEFAULT 0,
  total      DECIMAL(10,2) NOT NULL DEFAULT 0,
  status     ENUM('pending','paid') NOT NULL DEFAULT 'pending',
  earned_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at    TIMESTAMP NULL DEFAULT NULL,
  payout_id  CHAR(36) NULL,
  UNIQUE KEY uniq_order (order_id),
  INDEX idx_rider_status (rider_id, status),
  FOREIGN KEY (rider_id)  REFERENCES riders(id)         ON DELETE CASCADE,
  FOREIGN KEY (order_id)  REFERENCES orders(id)         ON DELETE CASCADE,
  FOREIGN KEY (payout_id) REFERENCES rider_payouts(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
