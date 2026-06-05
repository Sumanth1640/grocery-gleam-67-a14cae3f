<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');

$uid = current_user_id();
$wh_ids     = my_warehouse_ids($uid);
$outlet_ids = my_outlet_ids($uid);

if (empty($wh_ids) && empty($outlet_ids)) {
  json_error('Not a warehouse or outlet manager', 403);
}

$clauses = [];
$params  = [];
if (!empty($wh_ids)) {
  $ph = implode(',', array_fill(0, count($wh_ids), '?'));
  $clauses[] = "o.warehouse_id IN ($ph)";
  $params = array_merge($params, $wh_ids);
}
if (!empty($outlet_ids)) {
  $ph = implode(',', array_fill(0, count($outlet_ids), '?'));
  $clauses[] = "o.outlet_id IN ($ph)";
  $params = array_merge($params, $outlet_ids);
}
$where = '(' . implode(' OR ', $clauses) . ')';

$sql = "SELECT r.*, o.warehouse_id, o.outlet_id, o.total AS order_total,
               u.email AS user_email, u.full_name AS user_name
        FROM refund_requests r
        JOIN orders o ON o.id = r.order_id
        LEFT JOIN users u ON u.id = r.user_id
        WHERE $where
        ORDER BY r.created_at DESC
        LIMIT 300";
$st = db()->prepare($sql);
$st->execute($params);
json_ok($st->fetchAll());
