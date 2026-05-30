<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$sql = "SELECT o.id, o.total, o.status, o.address, o.created_at,
               u.full_name, u.phone,
               a.id AS a_id, a.status AS a_status, r.name AS r_name
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN order_assignments a ON a.order_id = o.id
        LEFT JOIN riders r ON r.id = a.rider_id
        WHERE o.status IN ('placed','accepted','preparing','out_for_delivery')
        ORDER BY o.created_at DESC LIMIT 200";
$rows = db()->query($sql)->fetchAll();
foreach ($rows as &$r) {
  $r['address'] = json_decode($r['address'] ?? '{}', true) ?: null;
  $r['assignment'] = $r['a_id']
    ? ['id' => $r['a_id'], 'status' => $r['a_status'], 'riders' => ['name' => $r['r_name'] ?? '']]
    : null;
  unset($r['a_id'], $r['a_status'], $r['r_name']);
}
json_ok($rows);
