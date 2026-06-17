<?php
require_once __DIR__ . '/../../../rider_helpers.php';
require_method('POST');
require_admin();
$b = json_body();
$rider_id = (string)($b['rider_id'] ?? '');
$notes    = trim((string)($b['notes'] ?? ''));
if ($rider_id === '') json_error('Missing rider_id');

$st = db()->prepare("SELECT id, total, earned_at FROM rider_earnings
                     WHERE rider_id = ? AND status = 'pending'");
$st->execute([$rider_id]);
$rows = $st->fetchAll();
if (!$rows) json_error('Nothing to pay out');

$amount = 0.0;
$dates  = [];
$ids    = [];
foreach ($rows as $r) {
  $amount += (float)$r['total'];
  $dates[] = $r['earned_at'];
  $ids[]   = $r['id'];
}
sort($dates);

$payout_id = uuid_v4();
db()->prepare(
  'INSERT INTO rider_payouts (id, rider_id, amount, period_start, period_end, status, paid_at, notes)
   VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP,?)'
)->execute([$payout_id, $rider_id, $amount, $dates[0], end($dates), 'paid', $notes ?: null]);

$ph = implode(',', array_fill(0, count($ids), '?'));
$st = db()->prepare("UPDATE rider_earnings SET status='paid', paid_at=CURRENT_TIMESTAMP, payout_id=?
                     WHERE id IN ($ph)");
$st->execute([$payout_id, ...$ids]);

// Notify rider
$u = db()->prepare('SELECT user_id FROM riders WHERE id = ?');
$u->execute([$rider_id]);
$user_id = $u->fetchColumn();
if ($user_id) {
  notify_user($user_id, 'system', 'Payout received 💰',
    '₹' . number_format($amount, 2) . ' has been paid out to you.', '/rider');
}
json_ok(['ok' => true, 'amount' => $amount, 'count' => count($rows)]);
