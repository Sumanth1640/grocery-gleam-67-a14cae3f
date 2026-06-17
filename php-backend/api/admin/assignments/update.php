<?php
require_once __DIR__ . '/../../../rider_helpers.php';
require_method('POST');
require_admin();
$b = json_body();
// Accept either {id} (assignment id) or {order_id} from the client.
$id       = (string)($b['id'] ?? '');
$order_id = (string)($b['order_id'] ?? '');
$status   = (string)($b['status'] ?? '');
$allowed  = ['assigned','picked_up','delivered','cancelled'];
if (($id === '' && $order_id === '') || !in_array($status, $allowed, true)) json_error('Invalid input');

if ($id === '') {
  $st = db()->prepare('SELECT id FROM order_assignments WHERE order_id = ? LIMIT 1');
  $st->execute([$order_id]);
  $id = (string)$st->fetchColumn();
  if ($id === '') json_error('Assignment not found', 404);
}

$extra = '';
if ($status === 'picked_up') $extra = ', picked_up_at = CURRENT_TIMESTAMP';
if ($status === 'delivered') $extra = ', delivered_at = CURRENT_TIMESTAMP';
db()->prepare("UPDATE order_assignments SET status = ? $extra WHERE id = ?")->execute([$status, $id]);

if ($status === 'delivered') {
  $st = db()->prepare('SELECT order_id, rider_id FROM order_assignments WHERE id = ?');
  $st->execute([$id]);
  $a = $st->fetch();
  if ($a) {
    db()->prepare("UPDATE orders SET status = 'delivered' WHERE id = ?")->execute([$a['order_id']]);
    record_rider_earning($a['rider_id'], $a['order_id']);
  }
} elseif ($status === 'picked_up') {
  $st = db()->prepare('SELECT order_id FROM order_assignments WHERE id = ?');
  $st->execute([$id]);
  $oid = $st->fetchColumn();
  if ($oid) db()->prepare("UPDATE orders SET status = 'out_for_delivery' WHERE id = ?")->execute([$oid]);
}
json_ok(['ok' => true]);
