<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$slug = $_GET['slug'] ?? null;
if (!$slug) json_error('slug required');

$r = db()->prepare('SELECT id, slug, name, cuisine, image, rating, eta, price_for_two FROM restaurants WHERE slug = ? AND is_active = 1');
$r->execute([$slug]);
$restaurant = $r->fetch();
if (!$restaurant) json_error('Restaurant not found', 404);
$restaurant['rating'] = (float)$restaurant['rating'];
$restaurant['price_for_two'] = (int)$restaurant['price_for_two'];

$d = db()->prepare('SELECT id, name, description, image, price, is_veg, category FROM dishes WHERE restaurant_id = ? AND is_available = 1 ORDER BY category, name');
$d->execute([$restaurant['id']]);
$dishes = array_map(function ($x) {
  $x['price']  = (int)$x['price'];
  $x['is_veg'] = (bool)$x['is_veg'];
  return $x;
}, $d->fetchAll());

json_ok(['restaurant' => $restaurant, 'dishes' => $dishes]);
