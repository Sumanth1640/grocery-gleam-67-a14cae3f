<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();
$where = ''; $params = [];
if (!$is_admin) {
  if (empty($wh_ids)) json_ok([]);
  $ph = implode(',', array_fill(0, count($wh_ids), '?'));
  $where = "WHERE ps.warehouse_id IN ($ph)";
  $params = $wh_ids;
}
$sql = "SELECT ps.*, p.name AS product_name, p.image AS product_image, p.slug AS product_slug,
               w.name AS warehouse_name
        FROM product_stock ps
        JOIN products p ON p.id = ps.product_id
        JOIN warehouses w ON w.id = ps.warehouse_id
        $where AND ps.qty <= ps.low_stock_threshold
        ORDER BY ps.qty ASC LIMIT 200";
// Strip leading AND when no WHERE
$sql = str_replace("$where AND", $where ? "$where AND" : 'WHERE', $sql);
if (!$where) $sql = str_replace('WHERE AND', 'WHERE', $sql);
$st = db()->prepare($sql); $st->execute($params);
json_ok($st->fetchAll());
