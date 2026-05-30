<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$sql = "SELECT r.*,
               (SELECT COUNT(*) FROM order_assignments a
                  WHERE a.rider_id = r.id AND a.status IN ('assigned','picked_up')) AS active_orders
        FROM riders r ORDER BY r.created_at DESC";
$rows = db()->query($sql)->fetchAll();
foreach ($rows as &$r) {
  $r['is_active']     = (bool)$r['is_active'];
  $r['active_orders'] = (int)$r['active_orders'];
}
json_ok($rows);
