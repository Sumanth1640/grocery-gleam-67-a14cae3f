<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
$user = require_user();
$wid = (string)(json_body()['warehouse_id'] ?? '');
if ($wid === '') json_error('Missing warehouse_id');
if (!has_role($user['id'], 'admin') && !manages_warehouse($user['id'], $wid)) {
  json_error('Not allowed for this warehouse', 403);
}
$stockSt = db()->prepare('SELECT * FROM product_stock WHERE warehouse_id=?');
$stockSt->execute([$wid]);
$stockByPid = [];
foreach ($stockSt->fetchAll() as $s) $stockByPid[$s['product_id']] = $s;

$products = db()->query('SELECT id, name, slug, image FROM products ORDER BY name ASC')->fetchAll();
$out = [];
foreach ($products as $p) {
  $s = $stockByPid[$p['id']] ?? null;
  $out[] = [
    'product' => $p,
    'qty'     => $s ? (int)$s['qty'] : 0,
    'low_stock_threshold' => $s ? (int)$s['low_stock_threshold'] : 5,
    'has_row' => $s ? true : false,
  ];
}
json_ok($out);
