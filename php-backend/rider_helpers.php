<?php
// ============================================================
// rider_helpers.php — shared helpers for the rider/delivery system.
// Mirrors the Lovable Cloud (Supabase) rider.functions / earnings.functions.
// ============================================================

require_once __DIR__ . '/config.php';

/** Return the rider row for a given auth user, or null. */
function rider_for_user(string $user_id): ?array {
  $st = db()->prepare('SELECT * FROM riders WHERE user_id = ? LIMIT 1');
  $st->execute([$user_id]);
  $r = $st->fetch();
  return $r ?: null;
}

/** Require the current user to be an approved, active rider. Returns the rider row. */
function require_rider(): array {
  $uid = current_user_id();
  $r = rider_for_user($uid);
  if (!$r) json_error('Not a rider', 403);
  return $r;
}

/** Read the rider flat fee from app_settings (defaults to 40). */
function rider_flat_fee(): float {
  $st = db()->query("SELECT `value` FROM app_settings WHERE `key` = 'rider_flat_fee' LIMIT 1");
  $v = $st->fetchColumn();
  return $v === false || $v === null || $v === '' ? 40.0 : (float)$v;
}

/**
 * Record an earning row for a delivered order. Idempotent via UNIQUE(order_id).
 * Mirrors the Supabase `record_rider_earning` trigger.
 */
function record_rider_earning(string $rider_id, string $order_id): void {
  $fee = rider_flat_fee();
  $id  = uuid_v4();
  db()->prepare(
    'INSERT IGNORE INTO rider_earnings (id, rider_id, order_id, base_fee, total, status, earned_at)
     VALUES (?, ?, ?, ?, ?, "pending", CURRENT_TIMESTAMP)'
  )->execute([$id, $rider_id, $order_id, $fee, $fee]);
}

/** Convenience: insert a notification row. */
function notify_user(string $user_id, string $kind, string $title, string $body, ?string $link = null): void {
  db()->prepare(
    'INSERT INTO notifications (id, user_id, kind, title, body, link) VALUES (?,?,?,?,?,?)'
  )->execute([uuid_v4(), $user_id, $kind, $title, $body, $link]);
}
