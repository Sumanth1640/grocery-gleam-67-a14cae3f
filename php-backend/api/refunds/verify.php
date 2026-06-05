<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');

$uid = current_user_id();
$b   = json_body();
$id            = (string)($b['id'] ?? '');
$status        = (string)($b['status'] ?? '');
$verifier_note = trim((string)($b['verifier_note'] ?? ''));

if ($id === '' || !in_array($status, ['verified', 'rejected'], true)) {
  json_error('Invalid input');
}

// Load refund + order to authorise verifier.
$st = db()->prepare(
  'SELECT r.id, r.status, r.verification_status, o.warehouse_id, o.outlet_id, r.user_id, r.order_id, r.amount
     FROM refund_requests r
     JOIN orders o ON o.id = r.order_id
    WHERE r.id = ?
    LIMIT 1'
);
$st->execute([$id]);
$row = $st->fetch();
if (!$row) json_error('Refund request not found', 404);

if ($row['status'] !== 'pending') {
  json_error('Refund already resolved by admin', 409);
}

$is_wh_mgr     = !empty($row['warehouse_id']) && manages_warehouse($uid, (string)$row['warehouse_id']);
$is_outlet_mgr = !empty($row['outlet_id'])    && manages_outlet($uid, (string)$row['outlet_id']);

if (!$is_wh_mgr && !$is_outlet_mgr) {
  json_error('You cannot verify this refund', 403);
}

db()->prepare(
  'UPDATE refund_requests
      SET verification_status = ?, verifier_note = ?, verified_by = ?, verified_at = NOW()
    WHERE id = ?'
)->execute([$status, $verifier_note, $uid, $id]);

// Best-effort notify customer + admins.
try {
  require_once __DIR__ . '/../../order_helpers.php';
  if (function_exists('notify_user') && !empty($row['user_id'])) {
    if ($status === 'verified') {
      notify_user((string)$row['user_id'], 'order', 'Refund verified',
        'Your refund request was verified and forwarded to admin for processing.',
        '/orders/' . (string)$row['order_id']);
    } else {
      notify_user((string)$row['user_id'], 'order', 'Refund rejected',
        $verifier_note !== '' ? $verifier_note : 'Your refund request was rejected after review.',
        '/orders/' . (string)$row['order_id']);
    }
  }
  // Mark request as rejected at top-level too when manager rejects.
  if ($status === 'rejected') {
    db()->prepare("UPDATE refund_requests SET status = 'rejected', admin_note = ? WHERE id = ?")
        ->execute(['Rejected by manager: ' . $verifier_note, $id]);
  }
} catch (Throwable $e) { /* non-fatal */ }

json_ok(['ok' => true, 'verification_status' => $status]);
