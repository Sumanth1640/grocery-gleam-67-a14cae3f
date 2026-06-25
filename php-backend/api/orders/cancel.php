<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$uid = current_user_id();
$in  = json_body();
$id  = $in['id'] ?? null;
if (!$id) json_error('id required');

$stmt = db()->prepare('SELECT id, status, user_id FROM orders WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) json_error('Order not found', 404);

$is_admin = has_role($uid, 'admin');
if ($row['user_id'] !== $uid && !$is_admin) json_error('Order not found', 404);
if ($row['status'] !== 'placed') json_error('Order can no longer be cancelled', 400);

$upd = db()->prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?");
$upd->execute([$id]);

require_once __DIR__ . '/../../notification_helpers.php';
notify_user($row['user_id'], 'order', 'Order cancelled',
  'Your order has been cancelled.', '/orders/'.$id);

json_ok(['ok' => true]);
