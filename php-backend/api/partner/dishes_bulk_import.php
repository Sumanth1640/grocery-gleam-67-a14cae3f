<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_error('Create your restaurant first');
$body = json_body();
$dishes = is_array($body['dishes'] ?? null) ? $body['dishes'] : [];
if (!$dishes) json_error('No rows');
$stmt = db()->prepare('INSERT INTO partner_dishes
  (id, restaurant_id, name, description, image, section, price, mrp, veg, spicy, bestseller, in_stock, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$count = 0;
foreach ($dishes as $i => $d) {
  $stmt->execute([
    uuid_v4(), $r['id'],
    (string)($d['name'] ?? 'Item'),
    (string)($d['description'] ?? ''),
    (string)($d['image'] ?? ''),
    (string)($d['section'] ?? 'Mains'),
    (int)($d['price'] ?? 0),
    isset($d['mrp']) && $d['mrp'] !== null ? (int)$d['mrp'] : null,
    !empty($d['veg']) ? 1 : (isset($d['veg']) ? 0 : 1),
    !empty($d['spicy']) ? 1 : 0,
    !empty($d['bestseller']) ? 1 : 0,
    isset($d['in_stock']) ? ((int)!!$d['in_stock']) : 1,
    $i,
  ]);
  $count++;
}
json_ok(['inserted' => $count]);
