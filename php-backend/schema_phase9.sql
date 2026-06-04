-- Phase 9: refund proof attachments
-- Run AFTER schema_phase4.sql

ALTER TABLE refund_requests
  ADD COLUMN IF NOT EXISTS proof_urls JSON NULL AFTER details;
