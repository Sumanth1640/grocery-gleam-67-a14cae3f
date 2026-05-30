<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
$reason = trim((string)($b['reason'] ?? ''));
$details = trim((string)($b['details'] ?? ''));
$amount = (int)($b['amount'] ?? 0);
if ($order_id==='' || $reason==='') json_error('Missing fields');
$st = db()->prepare('SELECT user_id, total FROM orders WHERE id=?');
$st->execute([$order_id]); $o = $st->fetch();
if (!$o || $o['user_id'] !== $uid) json_error('Order not found', 404);
$amount = $amount > 0 ? min($amount, (int)$o['total']) : (int)$o['total'];
$id = uuid_v4();
db()->prepare('INSERT INTO refund_requests (id,order_id,user_id,reason,details,amount,status,admin_note) VALUES (?,?,?,?,?,?,?,?)')
   ->execute([$id,$order_id,$uid,$reason,$details,$amount,'pending','']);
json_ok(['id'=>$id]);
