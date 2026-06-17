<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query(
  "SELECT e.id, e.rider_id, e.total, e.status, e.earned_at, e.order_id,
          r.name AS r_name, r.phone AS r_phone, r.vehicle AS r_vehicle, r.vehicle_no AS r_vehicle_no
     FROM rider_earnings e
     LEFT JOIN riders r ON r.id = e.rider_id
    WHERE e.status = 'pending'
    ORDER BY e.earned_at DESC"
)->fetchAll();

$groups = [];
foreach ($rows as $r) {
  $k = $r['rider_id'];
  if (!isset($groups[$k])) {
    $groups[$k] = [
      'rider_id' => $k,
      'rider' => [
        'name' => $r['r_name'], 'phone' => $r['r_phone'],
        'vehicle' => $r['r_vehicle'], 'vehicle_no' => $r['r_vehicle_no'],
      ],
      'count' => 0, 'total' => 0.0,
      'earliest' => $r['earned_at'], 'latest' => $r['earned_at'],
      'earnings' => [],
    ];
  }
  $g = &$groups[$k];
  $g['count'] += 1;
  $g['total'] += (float)$r['total'];
  if ($r['earned_at'] < $g['earliest']) $g['earliest'] = $r['earned_at'];
  if ($r['earned_at'] > $g['latest'])   $g['latest']   = $r['earned_at'];
  $g['earnings'][] = [
    'id' => $r['id'], 'total' => $r['total'], 'status' => $r['status'],
    'order_id' => $r['order_id'], 'earned_at' => to_iso_utc($r['earned_at']),
  ];
  unset($g);
}
$out = array_values($groups);
foreach ($out as &$g) {
  $g['earliest'] = to_iso_utc($g['earliest']);
  $g['latest']   = to_iso_utc($g['latest']);
}
usort($out, fn($a, $b) => $b['total'] <=> $a['total']);
json_ok($out);
