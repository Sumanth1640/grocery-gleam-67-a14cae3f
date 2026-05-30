<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$days = max(1, min(365, (int)($b['days'] ?? 30)));

// Daily series
$st = db()->prepare("SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
                     FROM orders WHERE created_at >= (NOW() - INTERVAL ? DAY)
                     GROUP BY DATE(created_at) ORDER BY date ASC");
$st->execute([$days]);
$series = $st->fetchAll();
foreach ($series as &$s) { $s['orders'] = (int)$s['orders']; $s['revenue'] = (float)$s['revenue']; }

// Totals
$revenue = 0.0; $orders = 0;
foreach ($series as $s) { $revenue += $s['revenue']; $orders += $s['orders']; }
$aov = $orders ? round($revenue / $orders, 2) : 0;

// Top items (parses items JSON)
$itemsSt = db()->prepare("SELECT items FROM orders
                          WHERE created_at >= (NOW() - INTERVAL ? DAY) AND items IS NOT NULL");
$itemsSt->execute([$days]);
$topMap = [];
foreach ($itemsSt->fetchAll() as $row) {
  $items = json_decode($row['items'] ?? '[]', true) ?: [];
  foreach ($items as $it) {
    $name = $it['product']['name'] ?? null;
    if (!$name) continue;
    $qty = (int)($it['qty'] ?? 1);
    $price = (float)($it['product']['price'] ?? 0);
    if (!isset($topMap[$name])) $topMap[$name] = ['name'=>$name,'qty'=>0,'revenue'=>0];
    $topMap[$name]['qty'] += $qty;
    $topMap[$name]['revenue'] += $qty * $price;
  }
}
usort($topMap, fn($a,$b)=>$b['revenue']<=>$a['revenue']);
$topItems = array_slice(array_values($topMap), 0, 10);

// Payment split
$pst = db()->prepare("SELECT payment AS name, COUNT(*) AS value FROM orders
                      WHERE created_at >= (NOW() - INTERVAL ? DAY) GROUP BY payment");
$pst->execute([$days]);
$paymentSplit = $pst->fetchAll();
foreach ($paymentSplit as &$p) { $p['value'] = (int)$p['value']; }

json_ok([
  'revenue' => $revenue,
  'orders'  => $orders,
  'aov'     => $aov,
  'series'  => $series,
  'topItems'=> $topItems,
  'paymentSplit' => $paymentSplit,
]);
