<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();

$where = ''; $params = [];
if (!$is_admin) {
  if (empty($wh_ids)) json_ok([]);
  $ph = implode(',', array_fill(0, count($wh_ids), '?'));
  $where = "WHERE o.warehouse_id IN ($ph)";
  $params = $wh_ids;
}
$sql = "SELECT o.*, u.full_name, u.phone AS user_phone, u.email
        FROM orders o LEFT JOIN users u ON u.id = o.user_id
        $where ORDER BY o.created_at DESC LIMIT 500";
$st = db()->prepare($sql); $st->execute($params);
$rows = $st->fetchAll();
foreach ($rows as &$r) {
  $r['items'] = json_decode($r['items'] ?? '[]', true) ?: [];
  $r['address'] = json_decode($r['address'] ?? '{}', true) ?: null;
}
json_ok($rows);
