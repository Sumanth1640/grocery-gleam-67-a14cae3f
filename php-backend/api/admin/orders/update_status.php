<?php
require_once __DIR__ . '/../../../config.php';
require_once __DIR__ . '/../../../notification_helpers.php';
require_method('POST');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$allowed = ['placed','accepted','preparing','packed','ready','out_for_delivery','delivered','cancelled'];
if ($id==='' || !in_array($status, $allowed, true)) json_error('Invalid input');
$st = db()->prepare('SELECT warehouse_id, user_id FROM orders WHERE id=?');
$st->execute([$id]); $row = $st->fetch();
if (!$row) json_error('Order not found', 404);
if (!$is_admin) {
  if (!$row['warehouse_id'] || !in_array($row['warehouse_id'], $wh_ids, true)) json_error('Not your warehouse', 403);
}
db()->prepare('UPDATE orders SET status=? WHERE id=?')->execute([$status, $id]);
if (!empty($row['user_id'])) {
  $pretty = str_replace('_',' ',$status);
  notify_user($row['user_id'], 'order', 'Order '.$pretty,
    'Your order status was updated to "'.$pretty.'".',
    '/orders/'.$id);
}
json_ok(['ok' => true, 'status' => $status]);
