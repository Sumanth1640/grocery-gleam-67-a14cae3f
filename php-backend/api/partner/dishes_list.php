<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('GET');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_ok([]);
$s = db()->prepare('SELECT * FROM partner_dishes WHERE restaurant_id = ? ORDER BY sort_order ASC, created_at DESC');
$s->execute([$r['id']]);
$rows = $s->fetchAll();
$ids = array_column($rows, 'id');
$variants = []; $addons = [];
if ($ids) {
  $in = implode(',', array_fill(0, count($ids), '?'));
  $v = db()->prepare("SELECT * FROM partner_dish_variants WHERE dish_id IN ($in) ORDER BY sort_order");
  $v->execute($ids);
  foreach ($v->fetchAll() as $row) {
    $row['price'] = (int)$row['price'];
    $variants[$row['dish_id']][] = $row;
  }
  $a = db()->prepare("SELECT * FROM partner_dish_addons WHERE dish_id IN ($in) ORDER BY sort_order");
  $a->execute($ids);
  foreach ($a->fetchAll() as $row) {
    $row['price'] = (int)$row['price'];
    $addons[$row['dish_id']][] = $row;
  }
}
$out = [];
foreach ($rows as $d) {
  $d = decode_dish_row($d);
  $d['partner_dish_variants'] = $variants[$d['id']] ?? [];
  $d['partner_dish_addons']   = $addons[$d['id']] ?? [];
  $out[] = $d;
}
json_ok($out);
