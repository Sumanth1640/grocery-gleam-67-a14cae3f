<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query(
  "SELECT p.id, p.rider_id, p.amount, p.period_start, p.period_end, p.status, p.paid_at, p.notes,
          r.name AS r_name, r.phone AS r_phone
     FROM rider_payouts p
     LEFT JOIN riders r ON r.id = p.rider_id
    ORDER BY p.paid_at DESC
    LIMIT 100"
)->fetchAll();
foreach ($rows as &$p) {
  $p['period_start'] = to_iso_utc($p['period_start']);
  $p['period_end']   = to_iso_utc($p['period_end']);
  $p['paid_at']      = to_iso_utc($p['paid_at']);
  $p['riders'] = ['name' => $p['r_name'], 'phone' => $p['r_phone']];
  unset($p['r_name'], $p['r_phone']);
}
json_ok($rows);
