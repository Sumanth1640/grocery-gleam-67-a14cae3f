<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_error('Create your restaurant first');
$body = json_body();
$id = (string)($body['id'] ?? '');
if (!$id) json_error('id required');
// confirm dish belongs to this restaurant
$chk = db()->prepare('SELECT id FROM partner_dishes WHERE id = ? AND restaurant_id = ?');
$chk->execute([$id, $r['id']]);
if (!$chk->fetch()) json_error('Not found', 404);

$d = is_array($body['dish'] ?? null) ? $body['dish'] : [];
$map = [
  'name'=>'name','description'=>'description','image'=>'image','section'=>'section',
  'price'=>'price','mrp'=>'mrp','veg'=>'veg','spicy'=>'spicy','bestseller'=>'bestseller',
  'in_stock'=>'in_stock','sort_order'=>'sort_order','outlet_id'=>'outlet_id',
  'available_from'=>'available_from','available_to'=>'available_to',
];
$set = []; $vals = [];
foreach ($map as $k => $col) {
  if (!array_key_exists($k, $d)) continue;
  $v = $d[$k];
  if (in_array($k, ['veg','spicy','bestseller','in_stock'])) $v = $v ? 1 : 0;
  if (in_array($k, ['price','sort_order'])) $v = (int)$v;
  if ($k === 'mrp') $v = $v === null || $v === '' ? null : (int)$v;
  if ($k === 'outlet_id' && ($v === '' || $v === null)) $v = null;
  $set[] = "$col = ?"; $vals[] = $v;
}
if (array_key_exists('available_days', $d) && is_array($d['available_days'])) {
  $set[] = 'available_days = ?';
  $vals[] = implode(',', array_map('intval', $d['available_days']));
}
if ($set) {
  $vals[] = $id;
  $stmt = db()->prepare('UPDATE partner_dishes SET '.implode(', ', $set).' WHERE id = ?');
  $stmt->execute($vals);
}

if (array_key_exists('variants', $body) && is_array($body['variants'])) {
  db()->prepare('DELETE FROM partner_dish_variants WHERE dish_id = ?')->execute([$id]);
  $iv = db()->prepare('INSERT INTO partner_dish_variants (id, dish_id, name, price, sort_order) VALUES (?,?,?,?,?)');
  foreach ($body['variants'] as $i => $v) {
    $iv->execute([uuid_v4(), $id, (string)$v['name'], (int)$v['price'], (int)($v['sort_order'] ?? $i)]);
  }
}
if (array_key_exists('addons', $body) && is_array($body['addons'])) {
  db()->prepare('DELETE FROM partner_dish_addons WHERE dish_id = ?')->execute([$id]);
  $ia = db()->prepare('INSERT INTO partner_dish_addons (id, dish_id, name, price, sort_order) VALUES (?,?,?,?,?)');
  foreach ($body['addons'] as $i => $v) {
    $ia->execute([uuid_v4(), $id, (string)$v['name'], (int)$v['price'], (int)($v['sort_order'] ?? $i)]);
  }
}
json_ok(['ok' => true]);
