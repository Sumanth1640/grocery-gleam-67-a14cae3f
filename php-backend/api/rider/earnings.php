<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_method('GET');
$rider = require_rider();
$st = db()->prepare(
  'SELECT id, order_id, base_fee, total, status, earned_at
     FROM rider_earnings
    WHERE rider_id = ?
    ORDER BY earned_at DESC
    LIMIT 100'
);
$st->execute([$rider['id']]);
$rows = $st->fetchAll();

$now = time();
$startDay   = strtotime(date('Y-m-d', $now));
$startWeek  = $now - 6 * 86400; $startWeek = strtotime(date('Y-m-d', $startWeek));
$startMonth = strtotime(date('Y-m-01', $now));

$today = $week = $month = $pending = $paid = 0.0;
$out = [];
foreach ($rows as $r) {
  $t = strtotime($r['earned_at'] . ' UTC');
  $v = (float)$r['total'];
  if ($t >= $startDay)   $today   += $v;
  if ($t >= $startWeek)  $week    += $v;
  if ($t >= $startMonth) $month   += $v;
  if ($r['status'] === 'pending') $pending += $v; else $paid += $v;
  $r['earned_at'] = to_iso_utc($r['earned_at']);
  $out[] = $r;
}
json_ok([
  'rows' => $out,
  'summary' => [
    'today' => $today, 'week' => $week, 'month' => $month,
    'pending' => $pending, 'paid' => $paid,
  ],
]);
