<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();
$where = 'WHERE ps.qty <= ps.low_stock_threshold';
$params = [];
if (!$is_admin) {
  if (empty($wh_ids)) json_ok([]);
  $ph = implode(',', array_fill(0, count($wh_ids), '?'));
  $where .= " AND ps.warehouse_id IN ($ph)";
  $params = $wh_ids;
}
$sql = "SELECT ps.*,
               p.name AS p_name, p.image AS p_image, p.slug AS p_slug,
               w.name AS w_name
        FROM product_stock ps
        JOIN products p   ON p.id = ps.product_id
        JOIN warehouses w ON w.id = ps.warehouse_id
        $where ORDER BY ps.qty ASC LIMIT 200";
$st = db()->prepare($sql); $st->execute($params);
$rows = $st->fetchAll();
foreach ($rows as &$r) {
  $r['qty']                  = (int)$r['qty'];
  $r['low_stock_threshold']  = (int)$r['low_stock_threshold'];
  $r['product']   = ['name' => $r['p_name'], 'image' => $r['p_image'], 'slug' => $r['p_slug']];
  $r['warehouse'] = ['name' => $r['w_name']];
  unset($r['p_name'],$r['p_image'],$r['p_slug'],$r['w_name']);
}
json_ok($rows);
