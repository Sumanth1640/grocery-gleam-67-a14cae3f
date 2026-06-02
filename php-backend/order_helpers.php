<?php
// Shared grocery order helpers used by COD and paid checkout flows.
require_once __DIR__ . '/partner_helpers.php';

function order_address_pincode(array $address): string {
  $raw = trim((string)($address['pincode'] ?? ''));
  $pin = preg_replace('/\D+/', '', $raw);
  if ($pin && preg_match('/^\d{4,8}$/', $pin)) return $pin;

  $haystack = implode(' ', array_map('strval', [
    $address['line1'] ?? '',
    $address['line2'] ?? '',
    $address['city'] ?? '',
  ]));
  if (preg_match('/\b(\d{4,8})\b/', $haystack, $m)) return $m[1];
  return '';
}

function resolve_warehouse_id_for_address(array $address): ?string {
  $pin = order_address_pincode($address);
  if ($pin === '') return null;

  try {
    $st = db()->prepare(
      'SELECT w.id FROM warehouses w
       JOIN warehouse_pincodes wp ON wp.warehouse_id = w.id
       WHERE w.is_active = 1 AND REPLACE(TRIM(wp.pincode), " ", "") = ?
       ORDER BY wp.priority DESC, w.sort_order ASC
       LIMIT 1'
    );
    $st->execute([$pin]);
    $id = $st->fetchColumn();
    if ($id) return (string)$id;

    $st = db()->prepare(
      'SELECT id FROM warehouses
       WHERE is_active = 1 AND REPLACE(TRIM(pincode), " ", "") = ?
       ORDER BY sort_order ASC
       LIMIT 1'
    );
    $st->execute([$pin]);
    $id = $st->fetchColumn();
    return $id ? (string)$id : null;
  } catch (Throwable $e) {
    return null;
  }
}

function notify_warehouse_managers_for_order(?string $warehouse_id, int $total, string $order_id): void {
  if (!$warehouse_id) return;

  try {
    $wname = null;
    $st = db()->prepare('SELECT name FROM warehouses WHERE id=?');
    $st->execute([$warehouse_id]);
    $wname = $st->fetchColumn() ?: null;

    $st = db()->prepare('SELECT user_id FROM warehouse_managers WHERE warehouse_id=?');
    $st->execute([$warehouse_id]);
    foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $mgrId) {
      notify_user($mgrId, 'order', 'New product order',
        'A customer placed an order of ₹'.$total.($wname ? ' at '.$wname : '').'.',
        '/admin/orders');
    }
  } catch (Throwable $e) { /* ignore notification failures */ }
}
