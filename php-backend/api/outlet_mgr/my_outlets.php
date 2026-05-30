<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('GET');
$uid = current_user_id();
$s = db()->prepare('SELECT m.id, m.outlet_id, m.restaurant_id, m.role,
                           o.name AS o_name, o.area AS o_area, o.pincode AS o_pincode, o.is_open AS o_is_open,
                           r.name AS r_name
                    FROM partner_outlet_managers m
                    LEFT JOIN partner_outlets o ON o.id = m.outlet_id
                    LEFT JOIN partner_restaurants r ON r.id = m.restaurant_id
                    WHERE m.user_id = ?');
$s->execute([$uid]);
$out = [];
foreach ($s->fetchAll() as $r) {
  $out[] = [
    'id' => $r['id'], 'outlet_id' => $r['outlet_id'], 'restaurant_id' => $r['restaurant_id'], 'role' => $r['role'],
    'outlet' => $r['outlet_id'] ? [
      'id' => $r['outlet_id'], 'name' => $r['o_name'], 'area' => $r['o_area'],
      'pincode' => $r['o_pincode'], 'is_open' => (int)$r['o_is_open'] === 1,
    ] : null,
    'restaurant_name' => $r['r_name'],
  ];
}
json_ok($out);
