<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();
$pid = $in['product_id'] ?? null;
if (!$pid) json_error('product_id required');

$chk = db()->prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?');
$chk->execute([$uid, $pid]);
$row = $chk->fetch();

if ($row) {
  $del = db()->prepare('DELETE FROM wishlist WHERE id = ?');
  $del->execute([$row['id']]);
  json_ok(['wishlisted' => false]);
} else {
  $ins = db()->prepare('INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)');
  $ins->execute([uuid_v4(), $uid, $pid]);
  json_ok(['wishlisted' => true]);
}
