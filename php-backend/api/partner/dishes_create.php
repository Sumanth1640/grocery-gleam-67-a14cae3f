<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_error('Create your restaurant first');
$body = json_body();
$d = is_array($body['dish'] ?? null) ? $body['dish'] : [];
$variants = is_array($body['variants'] ?? null) ? $body['variants'] : [];
$addons   = is_array($body['addons']   ?? null) ? $body['addons']   : [];

$name = trim((string)($d['name'] ?? ''));
if ($name === '') json_error('Dish name required');
$price = (int)($d['price'] ?? 0);
if ($price < 0) json_error('Invalid price');

$id = uuid_v4();
$stmt = db()->prepare('INSERT INTO partner_dishes
  (id, restaurant_id, outlet_id, name, description, image, section, price, mrp, veg, spicy, bestseller, in_stock,
   available_days, available_from, available_to, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
$days = is_array($d['available_days'] ?? null) ? implode(',', array_map('intval', $d['available_days'])) : '0,1,2,3,4,5,6';
$stmt->execute([
  $id, $r['id'],
  isset($d['outlet_id']) && $d['outlet_id'] ? $d['outlet_id'] : null,
  $name, (string)($d['description'] ?? ''), (string)($d['image'] ?? ''),
  (string)($d['section'] ?? 'Mains'),
  $price, isset($d['mrp']) && $d['mrp'] !== null ? (int)$d['mrp'] : null,
  !empty($d['veg']) ? 1 : 0, !empty($d['spicy']) ? 1 : 0, !empty($d['bestseller']) ? 1 : 0,
  isset($d['in_stock']) ? ((int)!!$d['in_stock']) : 1,
  $days, (string)($d['available_from'] ?? '00:00'), (string)($d['available_to'] ?? '23:59'),
  (int)($d['sort_order'] ?? 0),
]);

$iv = db()->prepare('INSERT INTO partner_dish_variants (id, dish_id, name, price, sort_order) VALUES (?,?,?,?,?)');
foreach ($variants as $i => $v) {
  $iv->execute([uuid_v4(), $id, (string)$v['name'], (int)$v['price'], (int)($v['sort_order'] ?? $i)]);
}
$ia = db()->prepare('INSERT INTO partner_dish_addons (id, dish_id, name, price, sort_order) VALUES (?,?,?,?,?)');
foreach ($addons as $i => $v) {
  $ia->execute([uuid_v4(), $id, (string)$v['name'], (int)$v['price'], (int)($v['sort_order'] ?? $i)]);
}
json_ok(['id' => $id]);
