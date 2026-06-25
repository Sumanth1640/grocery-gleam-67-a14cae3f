<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
$rider_id = (string)($b['rider_id'] ?? '');
if ($order_id === '' || $rider_id === '') json_error('Missing fields');

$st = db()->prepare('SELECT id, warehouse_id, status FROM orders WHERE id = ?');
$st->execute([$order_id]);
$order = $st->fetch();
if (!$order || !$order['warehouse_id']) json_error('Order has no warehouse', 404);
if (!manages_warehouse($uid, $order['warehouse_id'])) json_error('Not your warehouse', 403);

// Rider must be approved + active
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
$trace = __DIR__ . '/../../secrets/assign_trace.log';
@file_put_contents($trace, '['.date('c')."] [warehouse] assign order=$order_id rider=$rider_id rider_user_id=".($ru?:'(null)')."\n", FILE_APPEND);
if ($ru) {
  require_once __DIR__ . '/../../notification_helpers.php';
  try {
    $c = db()->prepare('SELECT COUNT(*) FROM device_tokens WHERE user_id = ?');
    $c->execute([$ru]); $n = (int)$c->fetchColumn();
    @file_put_contents($trace, '['.date('c')."] [warehouse] device_tokens for $ru = $n\n", FILE_APPEND);
  } catch (Throwable $e) {
    @file_put_contents($trace, '['.date('c')."] [warehouse] device_tokens lookup err: ".$e->getMessage()."\n", FILE_APPEND);
  }
  notify_user($ru, 'order', 'New delivery assigned', 'You have a new delivery. Open the rider app for details.', '/rider');
  @file_put_contents($trace, '['.date('c')."] [warehouse] notify_user returned\n", FILE_APPEND);
} else {
  @file_put_contents($trace, '['.date('c')."] [warehouse] SKIP: rider has no user_id\n", FILE_APPEND);
}

// Notify the customer that a rider has been assigned
require_once __DIR__ . '/../../notification_helpers.php';
$cst = db()->prepare('SELECT user_id FROM orders WHERE id = ?');
$cst->execute([$order_id]); $cu = $cst->fetchColumn();
if ($cu) {
  notify_user($cu, 'order', 'Rider assigned',
    'A delivery rider has been assigned to your order.', '/orders/'.$order_id);
}
json_ok(['ok' => true]);
