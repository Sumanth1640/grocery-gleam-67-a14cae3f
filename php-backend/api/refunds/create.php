<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
$reason = trim((string)($b['reason'] ?? ''));
$details = trim((string)($b['details'] ?? ''));
$amount = (int)($b['amount'] ?? 0);
$proof_in = $b['proof_urls'] ?? [];
if ($order_id==='' || $reason==='') json_error('Missing fields');

// Sanitize proof_urls: array of strings, max 5, each <= 500 chars
$proof = [];
if (is_array($proof_in)) {
  foreach ($proof_in as $u) {
    if (!is_string($u)) continue;
    $u = trim($u);
    if ($u === '' || strlen($u) > 500) continue;
    $proof[] = $u;
    if (count($proof) >= 5) break;
  }
}

$st = db()->prepare('SELECT user_id, total FROM orders WHERE id=?');
$st->execute([$order_id]); $o = $st->fetch();
if (!$o || $o['user_id'] !== $uid) json_error('Order not found', 404);
$amount = $amount > 0 ? min($amount, (int)$o['total']) : (int)$o['total'];
$id = uuid_v4();
db()->prepare('INSERT INTO refund_requests (id,order_id,user_id,reason,details,proof_urls,amount,status,admin_note) VALUES (?,?,?,?,?,?,?,?,?)')
   ->execute([$id,$order_id,$uid,$reason,$details, json_encode($proof, JSON_UNESCAPED_SLASHES), $amount,'pending','']);
json_ok(['id'=>$id]);
