<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$uid = current_user_id();
$stmt = db()->prepare('
  SELECT p.* FROM wishlist w
  JOIN products p ON p.id = w.product_id
  WHERE w.user_id = ? ORDER BY w.created_at DESC
');
$stmt->execute([$uid]);
$rows = array_map(function ($r) {
  $r['price']    = (int)$r['price'];
  $r['mrp']      = (int)$r['mrp'];
  $r['rating']   = (float)$r['rating'];
  $r['in_stock'] = (bool)$r['in_stock'];
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
