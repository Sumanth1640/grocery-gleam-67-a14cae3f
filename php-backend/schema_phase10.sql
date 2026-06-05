-- Phase 10 — Two-step refund flow: manager verifies, admin refunds.
-- Run once on your Hostinger MySQL/PostgreSQL DB.

ALTER TABLE refund_requests
  ADD COLUMN IF NOT EXISTS verification_status varchar(20) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_by char(36) NULL,
  ADD COLUMN IF NOT EXISTS verified_at timestamp NULL,
  ADD COLUMN IF NOT EXISTS verifier_note text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_refund_verification ON refund_requests(verification_status);
