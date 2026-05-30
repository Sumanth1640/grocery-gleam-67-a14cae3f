<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
[$is_admin, $wh_ids, $uid] = require_admin_or_warehouse_manager();

$products  = (int)db()->query('SELECT COUNT(*) FROM products')->fetchColumn();
$categories = (int)db()->query('SELECT COUNT(*) FROM categories')->fetchColumn();

if ($is_admin) {
  $orders  = (int)db()->query('SELECT COUNT(*) FROM orders')->fetchColumn();
  $revenue = (int)db()->query("SELECT COALESCE(SUM(total),0) FROM orders WHERE status='delivered'")->fetchColumn();
} else {
  if (empty($wh_ids)) { $orders = 0; $revenue = 0; }
  else {
    $ph = implode(',', array_fill(0, count($wh_ids), '?'));
    $st = db()->prepare("SELECT COUNT(*) FROM orders WHERE warehouse_id IN ($ph)");
    $st->execute($wh_ids); $orders = (int)$st->fetchColumn();
    $st = db()->prepare("SELECT COALESCE(SUM(total),0) FROM orders WHERE status='delivered' AND warehouse_id IN ($ph)");
    $st->execute($wh_ids); $revenue = (int)$st->fetchColumn();
  }
}
json_ok(compact('products','categories','orders','revenue'));
