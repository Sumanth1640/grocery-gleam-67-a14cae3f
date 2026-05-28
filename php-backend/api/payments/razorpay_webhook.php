<?php
// PUBLIC endpoint — no auth header. Verify HMAC signature.
require __DIR__ . '/../../config.php';
require_method('POST');

$secret = getenv('RAZORPAY_WEBHOOK_SECRET') ?: (defined('RAZORPAY_WEBHOOK_SECRET') ? RAZORPAY_WEBHOOK_SECRET : '');
if (!$secret) json_error('Webhook secret not configured', 500);

$raw = file_get_contents('php://input');
$sig = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
$expected = hash_hmac('sha256', $raw, $secret);
if (!hash_equals($expected, $sig)) json_error('Invalid signature', 401);

$evt = json_decode($raw, true);
$type = $evt['event'] ?? '';

if ($type === 'payment.captured' || $type === 'order.paid') {
  $payment = $evt['payload']['payment']['entity'] ?? null;
  $notes   = $payment['notes'] ?? [];
  $order_id_local = $notes['order_id'] ?? null; // pass your DB order id in notes when creating
  if ($order_id_local) {
    db()->prepare('UPDATE orders SET payment_status = ? WHERE id = ?')
        ->execute(['paid', $order_id_local]);
  }
}

json_ok(['received' => true]);
