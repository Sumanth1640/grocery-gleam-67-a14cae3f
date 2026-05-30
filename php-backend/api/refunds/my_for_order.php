<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$order_id = (string)(json_body()['order_id'] ?? '');
if ($order_id==='') json_ok(null);
$st = db()->prepare('SELECT * FROM refund_requests WHERE order_id=? AND user_id=? ORDER BY created_at DESC LIMIT 1');
$st->execute([$order_id,$uid]);
json_ok($st->fetch() ?: null);
