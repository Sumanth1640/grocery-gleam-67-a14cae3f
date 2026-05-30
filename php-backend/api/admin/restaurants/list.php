<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$status = (string)(json_body()['status'] ?? '');
$sql = "SELECT r.*,
               u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
        FROM partner_restaurants r
        LEFT JOIN users u ON u.id = r.owner_id";
$params = [];
if ($status !== '' && $status !== 'all') { $sql .= ' WHERE r.status = ?'; $params[] = $status; }
$sql .= ' ORDER BY r.created_at DESC';
$st = db()->prepare($sql); $st->execute($params);
$rows = $st->fetchAll();
foreach ($rows as &$r) {
  $r['cuisines']   = json_decode($r['cuisines'] ?? '[]', true) ?: [];
  $r['veg']        = (bool)$r['veg'];
  $r['is_open']    = (bool)$r['is_open'];
  $r['is_blocked'] = (bool)$r['is_blocked'];
}
json_ok($rows);
