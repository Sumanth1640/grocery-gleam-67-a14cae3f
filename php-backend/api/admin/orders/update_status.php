<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
[$is_admin, $wh_ids] = require_admin_or_warehouse_manager();
$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$allowed = ['placed','accepted','preparing','out_for_delivery','delivered','cancelled'];
if ($id==='' || !in_array($status, $allowed, true)) json_error('Invalid input');
if (!$is_admin) {
  $st = db()->prepare('SELECT warehouse_id FROM orders WHERE id=?');
  $st->execute([$id]); $wh = $st->fetchColumn();
  if (!$wh || !in_array($wh, $wh_ids, true)) json_error('Not your warehouse', 403);
}
db()->prepare('UPDATE orders SET status=? WHERE id=?')->execute([$status, $id]);
json_ok(['ok' => true, 'status' => $status]);
