<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$uid = current_user_id();
$stmt = db()->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50');
$stmt->execute([$uid]);

$rows = array_map(function ($r) {
  $r['items']    = json_decode($r['items'], true);
  $r['address']  = json_decode($r['address'], true);
  $r['subtotal'] = (int)$r['subtotal'];
  $r['delivery'] = (int)$r['delivery'];
  $r['total']    = (int)$r['total'];
  return $r;
}, $stmt->fetchAll());

json_ok($rows);
