<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$days = max(1, min(365, (int)(json_body()['days'] ?? 30)));
$r = db()->prepare('SELECT id, name, commission_rate, bank_account_name, bank_account_number, bank_ifsc
                    FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
$r->execute([$uid]);
$rest = $r->fetch();
if (!$rest) json_ok(null);
$since = date('Y-m-d H:i:s', strtotime("-".($days-1)." days 00:00"));
$o = db()->prepare('SELECT id, subtotal, total, status, created_at FROM orders
                    WHERE restaurant_id = ? AND created_at >= ? ORDER BY created_at DESC');
$o->execute([$rest['id'], $since]);
$orders = $o->fetchAll();
$rate = (float)$rest['commission_rate'];
$rows = [];
foreach ($orders as $o2) {
  $gross = (int)$o2['subtotal'];
  $com   = (int)round($gross * $rate / 100);
  $rows[] = [
    'id' => $o2['id'], 'date' => $o2['created_at'], 'status' => $o2['status'],
    'gross' => $gross, 'commission' => $com, 'payout' => $gross - $com,
  ];
}
$active = array_values(array_filter($rows, fn($x)=>$x['status']==='delivered'));
$totals = [
  'orders' => count($active),
  'gross'  => array_sum(array_column($active,'gross')),
  'commission' => array_sum(array_column($active,'commission')),
  'payout' => array_sum(array_column($active,'payout')),
];
$weeks = [];
foreach ($active as $x) {
  $ts = strtotime($x['date']);
  $dow = (int)date('N', $ts); // 1=Mon
  $monday = date('Y-m-d', $ts - ($dow-1)*86400);
  if (!isset($weeks[$monday])) $weeks[$monday] = ['week'=>$monday,'gross'=>0,'commission'=>0,'payout'=>0,'orders'=>0];
  $weeks[$monday]['gross'] += $x['gross'];
  $weeks[$monday]['commission'] += $x['commission'];
  $weeks[$monday]['payout'] += $x['payout'];
  $weeks[$monday]['orders'] += 1;
}
ksort($weeks);
json_ok([
  'restaurant' => [
    'name' => $rest['name'], 'commission_rate' => $rate,
    'bank_account_name' => $rest['bank_account_name'],
    'bank_account_number' => $rest['bank_account_number'],
    'bank_ifsc' => $rest['bank_ifsc'],
  ],
  'rows' => $rows,
  'totals' => $totals,
  'weekly' => array_values($weeks),
]);
