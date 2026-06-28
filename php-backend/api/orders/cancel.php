<?php
require __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../razorpay_helpers.php';
require_method('POST');

$uid = current_user_id();
$in  = json_body();
$id  = $in['id'] ?? null;
if (!$id) json_error('id required');

$stmt = db()->prepare('SELECT id, status, user_id, payment, payment_status, razorpay_payment_id, total FROM orders WHERE id = ?');
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row) json_error('Order not found', 404);

$is_admin = has_role($uid, 'admin');
if ($row['user_id'] !== $uid && !$is_admin) json_error('Order not found', 404);
if ($row['status'] !== 'placed') json_error('Order can no longer be cancelled', 400);

$upd = db()->prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?");
$upd->execute([$id]);

// Auto-refund prepaid (UPI/card) orders via Razorpay.
$refund_id    = null;
$refund_error = null;
$is_prepaid   = in_array((string)($row['payment'] ?? ''), ['upi', 'card'], true)
              && (string)($row['payment_status'] ?? '') === 'paid'
              && !empty($row['razorpay_payment_id']);

if ($is_prepaid) {
  $res = razorpay_refund_payment(
    (string)$row['razorpay_payment_id'],
    (int)$row['total'],
    ['order_id' => (string)$id, 'reason' => 'order_cancelled_by_' . ($is_admin ? 'admin' : 'customer')],
    'cancel_' . substr((string)$id, 0, 30)
  );
  if ($res['ok']) {
    $refund_id = $res['refund_id'];
    db()->prepare("UPDATE orders SET payment_status = 'refunded' WHERE id = ?")->execute([$id]);
  } else {
    $refund_error = $res['error'];
    error_log('cancel.php auto-refund failed for order '.$id.': '.$refund_error);
  }
}

require_once __DIR__ . '/../../notification_helpers.php';
if ($refund_id) {
  notify_user($row['user_id'], 'order', 'Order cancelled & refund initiated',
    'Your order has been cancelled. Refund of ₹'.(int)$row['total'].' will reflect in 5-7 business days.',
    '/orders/'.$id);
} elseif ($is_prepaid && $refund_error) {
  notify_user($row['user_id'], 'order', 'Order cancelled',
    'Your order has been cancelled. Refund could not be processed automatically — our team will issue it manually.',
    '/orders/'.$id);
} else {
  notify_user($row['user_id'], 'order', 'Order cancelled',
    'Your order has been cancelled.', '/orders/'.$id);
}

json_ok([
  'ok'                 => true,
  'refunded'           => (bool)$refund_id,
  'razorpay_refund_id' => $refund_id,
  'refund_error'       => $refund_error,
]);
