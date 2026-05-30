<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$sql = "SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.created_at,
               GROUP_CONCAT(DISTINCT ur.role) AS roles,
               GROUP_CONCAT(DISTINCT wm.warehouse_id) AS warehouse_ids
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN warehouse_managers wm ON wm.user_id = u.id
        WHERE ur.role IS NOT NULL OR wm.warehouse_id IS NOT NULL
        GROUP BY u.id ORDER BY u.created_at DESC";
$rows = db()->query($sql)->fetchAll();
foreach ($rows as &$r) {
  $r['roles'] = $r['roles'] ? explode(',', $r['roles']) : [];
  $r['warehouse_ids'] = $r['warehouse_ids'] ? explode(',', $r['warehouse_ids']) : [];
}
json_ok($rows);
