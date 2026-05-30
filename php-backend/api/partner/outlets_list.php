<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('GET');
$uid = current_user_id();
$s = db()->prepare('SELECT id, name FROM partner_restaurants WHERE owner_id = ?');
$s->execute([$uid]);
$rests = $s->fetchAll();
$ids = array_column($rests, 'id');
if (!$ids) json_ok(['restaurants' => [], 'outlets' => []]);
$in = implode(',', array_fill(0, count($ids), '?'));
$o = db()->prepare("SELECT * FROM partner_outlets WHERE restaurant_id IN ($in) ORDER BY sort_order");
$o->execute($ids);
$outlets = array_map(function($r){
  $r['is_open']=(int)$r['is_open']===1; $r['is_active']=(int)$r['is_active']===1;
  $r['eta_mins']=(int)$r['eta_mins']; $r['sort_order']=(int)$r['sort_order'];
  if ($r['lat'] !== null) $r['lat']=(float)$r['lat']; if ($r['lng'] !== null) $r['lng']=(float)$r['lng'];
  return $r;
}, $o->fetchAll());
json_ok(['restaurants' => $rests, 'outlets' => $outlets]);
