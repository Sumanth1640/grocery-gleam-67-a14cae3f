<?php
// Public restaurant detail — returns the partner_restaurant row (approved+open)
// with nested partner_dishes (each including variants & addons), in the same
// shape as the Supabase `getApprovedRestaurant` server function so the React
// loader can consume either source.
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';
require_method('GET');

$slug = $_GET['slug'] ?? null;
if (!$slug) json_error('slug required');

$rs = db()->prepare("SELECT * FROM partner_restaurants
  WHERE slug = ? AND status = 'approved' AND is_blocked = 0
    AND agreement_accepted_at IS NOT NULL LIMIT 1");
$rs->execute([$slug]);
$r = $rs->fetch();
if (!$r) json_error('Restaurant not found', 404);

$r['cuisines']      = json_decode($r['cuisines'] ?? '[]', true) ?: [];
$r['rating']        = (float)$r['rating'];
$r['reviews_count'] = (int)$r['reviews_count'];
$r['eta_mins']      = (int)$r['eta_mins'];
$r['cost_for_two']  = (int)$r['cost_for_two'];
$r['price_tier']    = (int)$r['price_tier'];
$r['distance_km']   = (float)$r['distance_km'];
$r['veg']           = (int)$r['veg'] === 1;
$r['is_open']       = (int)$r['is_open'] === 1;
$r['is_blocked']    = (int)$r['is_blocked'] === 1;

$ds = db()->prepare('SELECT * FROM partner_dishes WHERE restaurant_id = ? AND in_stock = 1 ORDER BY sort_order, name');
$ds->execute([$r['id']]);
$dishes = $ds->fetchAll();
$dishIds = array_column($dishes, 'id');
$variants = []; $addons = [];
if ($dishIds) {
  $in = implode(',', array_fill(0, count($dishIds), '?'));
  $v = db()->prepare("SELECT * FROM partner_dish_variants WHERE dish_id IN ($in) ORDER BY sort_order");
  $v->execute($dishIds);
  foreach ($v->fetchAll() as $row) {
    $row['price'] = (int)$row['price'];
    $variants[$row['dish_id']][] = $row;
  }
  $a = db()->prepare("SELECT * FROM partner_dish_addons WHERE dish_id IN ($in) ORDER BY sort_order");
  $a->execute($dishIds);
  foreach ($a->fetchAll() as $row) {
    $row['price'] = (int)$row['price'];
    $addons[$row['dish_id']][] = $row;
  }
}
$nested = [];
foreach ($dishes as $d) {
  $d = decode_dish_row($d);
  $d['partner_dish_variants'] = $variants[$d['id']] ?? [];
  $d['partner_dish_addons']   = $addons[$d['id']] ?? [];
  $nested[] = $d;
}
$r['partner_dishes'] = $nested;

json_ok($r);
