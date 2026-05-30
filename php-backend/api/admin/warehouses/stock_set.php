<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
$user = require_user();
$b = json_body();
$wid = (string)($b['warehouse_id'] ?? '');
$pid = (string)($b['product_id']   ?? '');
$qty = (int)($b['qty'] ?? 0);
$lst = (int)($b['low_stock_threshold'] ?? 5);
if ($wid==='' || $pid==='') json_error('Missing fields');
if (!has_role($user['id'], 'admin') && !manages_warehouse($user['id'], $wid)) {
  json_error('Not allowed for this warehouse', 403);
}
$id = uuid_v4();
db()->prepare('INSERT INTO product_stock (id,warehouse_id,product_id,qty,low_stock_threshold)
               VALUES (?,?,?,?,?)
               ON DUPLICATE KEY UPDATE qty=VALUES(qty), low_stock_threshold=VALUES(low_stock_threshold)')
  ->execute([$id,$wid,$pid,$qty,$lst]);
json_ok(['ok'=>true]);
