<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
$rider_id = (string)($b['rider_id'] ?? '');
if ($order_id === '' || $rider_id === '') json_error('Missing fields');

$st = db()->prepare('SELECT id, outlet_id, status FROM orders WHERE id = ?');
$st->execute([$order_id]);
$order = $st->fetch();
if (!$order || !$order['outlet_id']) json_error('Order has no outlet', 404);
if (!manages_outlet($uid, $order['outlet_id'])) json_error('Not your outlet', 403);

// Rider must be linked to this outlet and approved+active.
$st = db()->prepare('SELECT 1 FROM rider_outlets WHERE rider_id = ? AND outlet_id = ?');
$st->execute([$rider_id, $order['outlet_id']]);
if (!$st->fetchColumn()) json_error('Rider not linked to this outlet');

$st = db()->prepare("SELECT status, is_active FROM riders WHERE id = ?");
$st->execute([$rider_id]);
$r = $st->fetch();
if (!$r || $r['status'] !== 'approved' || !(int)$r['is_active']) json_error('Rider unavailable');

$st = db()->prepare('SELECT id, status FROM order_assignments WHERE order_id = ?');
$st->execute([$order_id]);
$existing = $st->fetch();
if ($existing) {
  if ($existing['status'] === 'delivered') json_error('Order already delivered');
  db()->prepare(
    "UPDATE order_assignments
        SET rider_id = ?, status = 'assigned', assigned_at = CURRENT_TIMESTAMP, picked_up_at = NULL
      WHERE id = ?"
  )->execute([$rider_id, $existing['id']]);
} else {
  db()->prepare(
    "INSERT INTO order_assignments (id, order_id, rider_id, status, notes)
     VALUES (?, ?, ?, 'assigned', '')"
  )->execute([uuid_v4(), $order_id, $rider_id]);
}

// Notify the rider (if linked to a user account)
$st = db()->prepare('SELECT user_id FROM riders WHERE id = ?');
$st->execute([$rider_id]); $ru = $st->fetchColumn();
if ($ru) {
  require_once __DIR__ . '/../../rider_helpers.php';
  notify_user($ru, 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider');
}
json_ok(['ok' => true]);
