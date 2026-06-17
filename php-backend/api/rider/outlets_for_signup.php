<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
current_user_id(); // any signed-in user can see public outlet list
$rows = db()->query(
  "SELECT o.id, o.name, o.area, o.pincode, r.name AS restaurant_name
     FROM partner_outlets o
     LEFT JOIN partner_restaurants r ON r.id = o.restaurant_id
    WHERE o.is_active = 1
    ORDER BY o.name"
)->fetchAll();
foreach ($rows as &$o) {
  $o['partner_restaurants'] = ['name' => $o['restaurant_name'] ?? ''];
  unset($o['restaurant_name']);
}
json_ok($rows);
