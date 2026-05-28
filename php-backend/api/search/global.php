<?php
require __DIR__ . '/../../config.php';
require_method('GET');
$q = trim($_GET['q'] ?? '');
if (strlen($q) < 2) json_ok(['products' => [], 'restaurants' => [], 'dishes' => []]);

$like = '%' . $q . '%';

$p = db()->prepare('SELECT id, slug, name, image, price, mrp, weight FROM products WHERE name LIKE ? LIMIT 10');
$p->execute([$like]);
$products = array_map(function ($r) {
  $r['price'] = (int)$r['price']; $r['mrp'] = (int)$r['mrp']; return $r;
}, $p->fetchAll());

$rests = [];
$dishes = [];
try {
  $r = db()->prepare('SELECT id, slug, name, cuisine, image, rating FROM restaurants WHERE name LIKE ? AND is_active = 1 LIMIT 10');
  $r->execute([$like]);
  $rests = array_map(function ($x) { $x['rating'] = (float)$x['rating']; return $x; }, $r->fetchAll());

  $d = db()->prepare('SELECT d.id, d.name, d.image, d.price, d.is_veg, r.slug AS restaurant_slug, r.name AS restaurant_name
                       FROM dishes d JOIN restaurants r ON r.id = d.restaurant_id
                       WHERE d.name LIKE ? AND d.is_available = 1 LIMIT 10');
  $d->execute([$like]);
  $dishes = array_map(function ($x) { $x['price'] = (int)$x['price']; $x['is_veg'] = (bool)$x['is_veg']; return $x; }, $d->fetchAll());
} catch (Throwable $e) {
  // restaurants/dishes tables may not exist if phase 2 schema not loaded
}

json_ok(['products' => $products, 'restaurants' => $rests, 'dishes' => $dishes]);
