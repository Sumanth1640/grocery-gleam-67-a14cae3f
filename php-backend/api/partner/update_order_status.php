<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();

$order_id = $in['order_id'] ?? null;
$status   = $in['status'] ?? null;
$allowed  = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled'];
if (!$order_id) json_error('order_id required');
if (!in_array($status, $allowed, true)) json_error('invalid status');

// Verify partner owns the restaurant on this order
$chk = db()->prepare('
  SELECT 1 FROM orders o
  JOIN restaurants r ON r.id = o.restaurant_id
  WHERE o.id = ? AND r.owner_id = ?
');
$chk->execute([$order_id, $uid]);
if (!$chk->fetch()) json_error('Forbidden', 403);

$stmt = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
$stmt->execute([$status, $order_id]);
json_ok(['updated' => $stmt->rowCount(), 'status' => $status]);
