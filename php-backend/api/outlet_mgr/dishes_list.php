<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$outlet_id = (string)(json_body()['outlet_id'] ?? '');
if (!$outlet_id) json_error('outlet_id required');
$m = db()->prepare('SELECT 1 FROM partner_outlet_managers WHERE user_id = ? AND outlet_id = ?');
$m->execute([$uid, $outlet_id]);
if (!$m->fetch()) json_error('Not your outlet', 403);
$s = db()->prepare('SELECT id, name, section, price, image, in_stock, outlet_id FROM partner_dishes
                    WHERE outlet_id = ? ORDER BY sort_order');
$s->execute([$outlet_id]);
$out = array_map(function($d){
  $d['price'] = (int)$d['price']; $d['in_stock'] = (int)$d['in_stock']===1; return $d;
}, $s->fetchAll());
json_ok($out);
