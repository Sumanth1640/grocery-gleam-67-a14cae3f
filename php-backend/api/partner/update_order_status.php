<?php
require __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../notification_helpers.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();

$order_id = $in['order_id'] ?? null;
$status   = $in['status'] ?? null;
$allowed  = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled'];
if (!$order_id) json_error('order_id required');
if (!in_array($status, $allowed, true)) json_error('invalid status');

$chk = db()->prepare('
  SELECT o.user_id FROM orders o
  JOIN restaurants r ON r.id = o.restaurant_id
  WHERE o.id = ? AND r.owner_id = ?
');
$chk->execute([$order_id, $uid]);
$row = $chk->fetch();
if (!$row) json_error('Forbidden', 403);

$stmt = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
$stmt->execute([$status, $order_id]);
if (!empty($row['user_id'])) {
  $pretty = str_replace('_',' ',$status);
  notify_user($row['user_id'], 'order', 'Order '.$pretty,
    'Your order status was updated to "'.$pretty.'".',
    '/orders/'.$order_id);
}
json_ok(['updated' => $stmt->rowCount(), 'status' => $status]);
