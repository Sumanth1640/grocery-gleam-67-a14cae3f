<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();

$where = ''; $params = [];
if (!$is_admin) {
  if (empty($wh_ids)) json_ok([]);
  $ph = implode(',', array_fill(0, count($wh_ids), '?'));
  // Warehouse managers only see grocery orders for their warehouses — never restaurant orders.
  $where = "WHERE o.warehouse_id IN ($ph) AND o.restaurant_id IS NULL";
  $params = $wh_ids;
}
$sql = "SELECT o.*, u.full_name, u.phone AS user_phone, u.email,
               w.name AS w_name, w.code AS w_code,
               r.name AS r_name,
               po.name AS po_name, po.pincode AS po_pincode
        FROM orders o
        LEFT JOIN users u              ON u.id = o.user_id
        LEFT JOIN warehouses w         ON w.id = o.warehouse_id
        LEFT JOIN partner_restaurants r ON r.id = o.restaurant_id
        LEFT JOIN partner_outlets po   ON po.id = o.outlet_id
        $where ORDER BY o.created_at DESC LIMIT 500";
$st = db()->prepare($sql); $st->execute($params);
$rows = $st->fetchAll();
foreach ($rows as &$r) {
  $r['items']   = json_decode($r['items']   ?? '[]', true) ?: [];
  $r['address'] = json_decode($r['address'] ?? '{}', true) ?: null;
  $r['warehouse'] = !empty($r['warehouse_id'])
    ? ['name' => $r['w_name'] ?? '', 'code' => $r['w_code'] ?? '']
    : null;
  $r['restaurant'] = !empty($r['restaurant_id'])
    ? ['name' => $r['r_name'] ?? '']
    : null;
  $r['outlet'] = !empty($r['outlet_id'])
    ? ['name' => $r['po_name'] ?? '', 'pincode' => $r['po_pincode'] ?? '']
    : null;
  if (isset($r['created_at'])) $r['created_at'] = to_iso_utc($r['created_at']);
  unset($r['w_name'], $r['w_code'], $r['r_name'], $r['po_name'], $r['po_pincode']);
}
json_ok($rows);
