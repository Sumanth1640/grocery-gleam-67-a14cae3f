<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();

$b = json_body();
$id = (string)($b['id'] ?? '');
$status = (string)($b['status'] ?? '');
$note = (string)($b['admin_note'] ?? '');
// Optional: when admin clicks "Approve", auto-trigger Razorpay refund (default true).
$auto_refund = array_key_exists('auto_refund', $b) ? (bool)$b['auto_refund'] : true;

if ($id === '' || !in_array($status, ['approved', 'rejected', 'refunded', 'pending'], true)) {
  json_error('Invalid input');
}

// Load the refund request + linked order so we can call Razorpay.
$st = db()->prepare(
  'SELECT r.id, r.order_id, r.amount, r.status AS req_status, r.verification_status,
          o.razorpay_payment_id, o.payment_status, o.total, o.payment
     FROM refund_requests r
     LEFT JOIN orders o ON o.id = r.order_id
    WHERE r.id = ?
    LIMIT 1'
);
$st->execute([$id]);
$row = $st->fetch();
if (!$row) json_error('Refund request not found', 404);

// Admin can only approve/refund a request that the warehouse/outlet manager has verified.
if (in_array($status, ['approved', 'refunded'], true)
    && ($row['verification_status'] ?? 'pending') !== 'verified') {
  json_error('Refund must be verified by warehouse/outlet manager before admin can approve.', 409);
}


$final_status = $status;
$final_note   = $note;
$rzp_refund_id = null;

// Trigger a real Razorpay refund when admin approves (or directly marks refunded)
// AND the original payment was captured online.
$should_refund_now = $auto_refund
  && in_array($status, ['approved', 'refunded'], true)
  && !empty($row['razorpay_payment_id'])
  && in_array((string)($row['payment'] ?? ''), ['upi', 'card'], true);

if ($should_refund_now) {
  $keys = razorpay_keys();
  if (empty($keys['key_id']) || empty($keys['key_secret'])) {
    json_error('Razorpay keys not configured on server', 500);
  }

  $amount_rupees = (int)($row['amount'] ?? 0);
  if ($amount_rupees <= 0) {
    $amount_rupees = (int)($row['total'] ?? 0);
  }
  if ($amount_rupees <= 0) {
    json_error('Refund amount must be greater than 0');
  }

  $payload = [
    'amount'    => $amount_rupees * 100, // paise
    'speed'     => 'normal',
    'notes'     => [
      'refund_request_id' => $id,
      'order_id'          => (string)$row['order_id'],
      'admin_note'        => $note,
    ],
    'receipt'   => 'refund_' . substr($id, 0, 30),
  ];

  $url = 'https://api.razorpay.com/v1/payments/' . rawurlencode((string)$row['razorpay_payment_id']) . '/refund';
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_USERPWD        => $keys['key_id'] . ':' . $keys['key_secret'],
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_TIMEOUT        => 30,
  ]);
  $resp     = curl_exec($ch);
  $http     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $curl_err = curl_error($ch);
  curl_close($ch);

  if ($resp === false) {
    json_error('Razorpay request failed: ' . $curl_err, 502);
  }
  $data = json_decode($resp, true);
  if ($http < 200 || $http >= 300) {
    $msg = $data['error']['description'] ?? ('Razorpay refund failed (HTTP ' . $http . ')');
    json_error($msg, 502);
  }

  $rzp_refund_id = (string)($data['id'] ?? '');
  $final_status  = 'refunded';
  $final_note    = trim(($note !== '' ? $note . ' | ' : '') . 'Razorpay refund ' . $rzp_refund_id);

  // Mark order as refunded too.
  try {
    db()->prepare("UPDATE orders SET payment_status = 'refunded', status = 'cancelled' WHERE id = ?")
        ->execute([(string)$row['order_id']]);
  } catch (Throwable $e) { /* payment_status column may be missing — non-fatal */ }
}

db()->prepare('UPDATE refund_requests SET status = ?, admin_note = ? WHERE id = ?')
    ->execute([$final_status, $final_note, $id]);

// Best-effort customer notification.
try {
  require_once __DIR__ . '/../../../order_helpers.php';
  if (function_exists('notify_user')) {
    $st2 = db()->prepare('SELECT user_id FROM refund_requests WHERE id = ?');
    $st2->execute([$id]);
    $uid = (string)$st2->fetchColumn();
    if ($uid !== '') {
      if ($final_status === 'refunded') {
        notify_user($uid, 'order', 'Refund processed',
          'Your refund of ₹' . (int)$row['amount'] . ' has been initiated and should reflect in 5-7 business days.',
          '/orders/' . (string)$row['order_id']);
      } elseif ($final_status === 'approved') {
        notify_user($uid, 'order', 'Refund approved',
          'Your refund request has been approved.',
          '/orders/' . (string)$row['order_id']);
      } elseif ($final_status === 'rejected') {
        notify_user($uid, 'order', 'Refund rejected',
          $note !== '' ? $note : 'Your refund request was rejected.',
          '/orders/' . (string)$row['order_id']);
      }
    }
  }
} catch (Throwable $e) { /* non-fatal */ }

json_ok(['ok' => true, 'status' => $final_status, 'razorpay_refund_id' => $rzp_refund_id]);
