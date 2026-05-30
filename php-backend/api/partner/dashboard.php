<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('GET');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_ok(null);

$sinceTs = strtotime('-6 days 00:00');
$since   = date('Y-m-d H:i:s', $sinceTs);
$today   = date('Y-m-d');

$o = db()->prepare('SELECT id, status, total, items, created_at, address, payment
                    FROM orders WHERE restaurant_id = ? AND created_at >= ?
                    ORDER BY created_at DESC LIMIT 500');
$o->execute([$r['id'], $since]);
$orders = array_map('decode_order_row', $o->fetchAll());

$out = db()->prepare('SELECT id, name, area, pincode, eta_mins, is_open, is_active
                      FROM partner_outlets WHERE restaurant_id = ? ORDER BY sort_order');
$out->execute([$r['id']]);
$outlets = $out->fetchAll();

$dh = db()->prepare('SELECT id, name, image, price, in_stock, rating FROM partner_dishes WHERE restaurant_id = ? LIMIT 500');
$dh->execute([$r['id']]);
$dishes = array_map('decode_dish_row', $dh->fetchAll());

$todayOrders = array_filter($orders, fn($o) => substr($o['created_at'],0,10) === $today && $o['status']==='delivered');
$todayRevenue = array_sum(array_column($todayOrders,'total'));
$pending     = array_filter($orders, fn($o) => in_array($o['status'], ['placed','preparing','ready']));
$cancelled7  = array_filter($orders, fn($o) => $o['status']==='cancelled');
$delivered7  = array_filter($orders, fn($o) => $o['status']==='delivered');
$revenue7    = array_sum(array_column($delivered7,'total'));
$aov         = count($delivered7) ? (int)round($revenue7 / count($delivered7)) : 0;

$series = [];
for ($i=6; $i>=0; $i--) {
  $d = date('Y-m-d', strtotime("-$i days"));
  $day = array_filter($orders, fn($o) => substr($o['created_at'],0,10)===$d && $o['status']==='delivered');
  $series[] = [
    'day' => $d,
    'label' => date('D', strtotime($d)),
    'revenue' => array_sum(array_column($day,'total')),
    'count' => count($day),
  ];
}

$tally = [];
foreach ($orders as $o) {
  $items = is_array($o['items']) ? $o['items'] : [];
  foreach ($items as $it) {
    $p = is_array($it['product'] ?? null) ? $it['product'] : [];
    $id = $p['id'] ?? $p['name'] ?? 'unknown';
    $name = $p['name'] ?? 'Item'; $image = $p['image'] ?? ''; $price = (int)($p['price'] ?? 0);
    $qty = (int)($it['qty'] ?? 0);
    if (!isset($tally[$id])) $tally[$id] = ['name'=>$name,'image'=>$image,'qty'=>0,'revenue'=>0];
    $tally[$id]['qty'] += $qty; $tally[$id]['revenue'] += $qty*$price;
  }
}
usort($tally, fn($a,$b) => $b['qty'] - $a['qty']);
$topDishes = array_slice(array_values($tally), 0, 5);

$outOfStock = array_slice(array_values(array_filter($dishes, fn($d)=>!$d['in_stock'])), 0, 6);

json_ok([
  'restaurant' => $r,
  'kpis' => [
    'todayOrders'   => count($todayOrders),
    'todayRevenue'  => (int)$todayRevenue,
    'pendingOrders' => count($pending),
    'revenue7'      => (int)$revenue7,
    'orders7'       => count($orders),
    'delivered7'    => count($delivered7),
    'cancelled7'    => count($cancelled7),
    'aov'           => $aov,
    'outletCount'   => count($outlets),
    'dishCount'     => count($dishes),
    'outOfStockCount' => count($outOfStock),
  ],
  'series' => $series,
  'topDishes' => $topDishes,
  'outlets' => $outlets,
  'outOfStock' => $outOfStock,
  'recentOrders' => array_slice($orders, 0, 8),
]);
