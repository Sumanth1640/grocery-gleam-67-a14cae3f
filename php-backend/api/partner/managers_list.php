<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$rid = (string)(json_body()['restaurant_id'] ?? '');
if (!$rid) json_error('restaurant_id required');
ensure_owns_restaurant($uid, $rid);
$o = db()->prepare('SELECT id, name, area, pincode FROM partner_outlets WHERE restaurant_id = ? ORDER BY sort_order');
$o->execute([$rid]);
$outlets = $o->fetchAll();
$m = db()->prepare('SELECT m.id, m.outlet_id, m.user_id, m.role, m.created_at,
                           u.email, u.full_name
                    FROM partner_outlet_managers m
                    LEFT JOIN users u ON u.id = m.user_id
                    WHERE m.restaurant_id = ?
                    ORDER BY m.created_at DESC');
$m->execute([$rid]);
$mgrs = array_map(function($r){
  return [
    'id' => $r['id'], 'outlet_id' => $r['outlet_id'], 'user_id' => $r['user_id'],
    'role' => $r['role'], 'created_at' => $r['created_at'],
    'email' => $r['email'], 'full_name' => $r['full_name'],
  ];
}, $m->fetchAll());
json_ok(['outlets' => $outlets, 'managers' => $mgrs]);
