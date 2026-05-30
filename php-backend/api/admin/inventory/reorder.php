<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();
$b = json_body();
$pid = (string)($b['product_id'] ?? '');
$wid = (string)($b['warehouse_id'] ?? '');
$qty = (int)($b['qty'] ?? 0);
if ($pid==='' || $wid==='' || $qty<=0) json_error('Invalid input');
if (!$is_admin && !in_array($wid, $wh_ids, true)) json_error('Not your warehouse', 403);
$st = db()->prepare('SELECT id, qty FROM product_stock WHERE warehouse_id=? AND product_id=?');
$st->execute([$wid,$pid]); $row = $st->fetch();
if ($row) {
  db()->prepare('UPDATE product_stock SET qty = qty + ? WHERE id = ?')->execute([$qty, $row['id']]);
} else {
  db()->prepare('INSERT INTO product_stock (id, warehouse_id, product_id, qty) VALUES (?,?,?,?)')
     ->execute([uuid_v4(),$wid,$pid,$qty]);
}
json_ok(['ok'=>true]);
