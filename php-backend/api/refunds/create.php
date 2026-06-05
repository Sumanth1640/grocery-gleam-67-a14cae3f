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

$st = db()->prepare('SELECT user_id, total, outlet_id, warehouse_id FROM orders WHERE id=?');
$st->execute([$order_id]); $o = $st->fetch();
if (!$o || $o['user_id'] !== $uid) json_error('Order not found', 404);
$amount = $amount > 0 ? min($amount, (int)$o['total']) : (int)$o['total'];
$id = uuid_v4();
db()->prepare('INSERT INTO refund_requests (id,order_id,user_id,reason,details,proof_urls,amount,status,admin_note) VALUES (?,?,?,?,?,?,?,?,?)')
   ->execute([$id,$order_id,$uid,$reason,$details, json_encode($proof, JSON_UNESCAPED_SLASHES), $amount,'pending','']);

// Notify the manager(s) who need to verify, plus admins (so they see the queue grow).
require_once __DIR__ . '/../../partner_helpers.php';
$title = 'New refund request';
$body  = 'Customer requested a refund of ₹' . $amount . ' — please verify the proof.';
if (!empty($o['outlet_id'])) {
  notify_outlet_managers((string)$o['outlet_id'], 'order', $title, $body, '/outlet/refunds');
}
if (!empty($o['warehouse_id'])) {
  notify_warehouse_managers((string)$o['warehouse_id'], 'order', $title, $body, '/admin/refunds-verify');
}
notify_admins('order', 'Refund request received', 'Refund of ₹' . $amount . ' awaiting manager verification.', '/admin/refunds');

json_ok(['id'=>$id]);
