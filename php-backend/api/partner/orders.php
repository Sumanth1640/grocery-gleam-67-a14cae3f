<?php
// List orders for a restaurant owner (partner)
require __DIR__ . '/../../config.php';
require_method('GET');
$uid = current_user_id();

// Find restaurants owned by this user
$r = db()->prepare('SELECT id FROM restaurants WHERE owner_id = ?');
$r->execute([$uid]);
$ids = array_column($r->fetchAll(), 'id');
if (count($ids) === 0) { json_ok([]); }

$in  = str_repeat('?,', count($ids) - 1) . '?';
$stmt = db()->prepare("SELECT * FROM orders WHERE restaurant_id IN ($in) ORDER BY created_at DESC LIMIT 100");
$stmt->execute($ids);
$rows = array_map(function ($r) {
  $r['items']    = json_decode($r['items'], true);
  $r['address']  = json_decode($r['address'], true);
  $r['subtotal'] = (int)$r['subtotal'];
  $r['delivery'] = (int)$r['delivery'];
  $r['total']    = (int)$r['total'];
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
