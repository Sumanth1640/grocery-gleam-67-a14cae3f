<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_once __DIR__ . '/../../notification_helpers.php';
require_method('POST');
$rider = require_rider();
$b = json_body();
$aid = (string)($b['assignment_id'] ?? '');
$status = (string)($b['status'] ?? '');
$proof = isset($b['proof_url']) ? (string)$b['proof_url'] : '';
if ($aid === '' || !in_array($status, ['picked_up','delivered','assigned'], true)) json_error('Invalid input');
if ($status === 'delivered' && $proof === '') json_error('Delivery proof photo is required');

$st = db()->prepare('SELECT id, order_id, rider_id FROM order_assignments WHERE id = ?');
$st->execute([$aid]);
$a = $st->fetch();
if (!$a || $a['rider_id'] !== $rider['id']) json_error('Assignment not found', 404);

$sets = ['status = ?'];
$params = [$status];
if ($status === 'picked_up')  $sets[] = 'picked_up_at = CURRENT_TIMESTAMP';
if ($status === 'delivered')  { $sets[] = 'delivered_at = CURRENT_TIMESTAMP'; $sets[] = 'proof_photo = ?'; $params[] = $proof; }
$params[] = $aid;
db()->prepare('UPDATE order_assignments SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);

$customer_id = null;
$cst = db()->prepare('SELECT user_id FROM orders WHERE id = ?');
$cst->execute([$a['order_id']]); $customer_id = $cst->fetchColumn();

if ($status === 'picked_up') {
  db()->prepare("UPDATE orders SET status = 'out_for_delivery' WHERE id = ?")->execute([$a['order_id']]);
  if ($customer_id) notify_user($customer_id, 'order', 'Order out for delivery',
    'Your rider has picked up your order and is on the way.', '/orders/'.$a['order_id']);
} elseif ($status === 'delivered') {
  db()->prepare("UPDATE orders SET status = 'delivered' WHERE id = ?")->execute([$a['order_id']]);
  record_rider_earning($rider['id'], $a['order_id']);
  if ($customer_id) notify_user($customer_id, 'order', 'Order delivered',
    'Your order has been delivered. Enjoy!', '/orders/'.$a['order_id']);
}
json_ok(['ok' => true]);
