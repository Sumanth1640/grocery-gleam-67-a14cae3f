<?php
// Shared Razorpay helpers.
require_once __DIR__ . '/config.php';

/**
 * Issue a Razorpay refund for a captured payment.
 *
 * @param string $payment_id  Razorpay payment id (pay_xxx)
 * @param int    $amount_rupees Amount to refund in INR (will be converted to paise)
 * @param array  $notes        Optional notes attached to the refund
 * @param string $receipt      Optional receipt id (<= 40 chars)
 * @return array  ['ok'=>bool, 'refund_id'=>?string, 'error'=>?string, 'http'=>int]
 */
function razorpay_refund_payment(string $payment_id, int $amount_rupees, array $notes = [], string $receipt = ''): array {
  if ($payment_id === '')        return ['ok'=>false, 'error'=>'missing payment_id', 'http'=>0, 'refund_id'=>null];
  if ($amount_rupees <= 0)       return ['ok'=>false, 'error'=>'amount must be > 0', 'http'=>0, 'refund_id'=>null];

  $keys = razorpay_keys();
  if (empty($keys['key_id']) || empty($keys['key_secret'])) {
    return ['ok'=>false, 'error'=>'Razorpay keys not configured', 'http'=>0, 'refund_id'=>null];
  }

  $payload = [
    'amount' => $amount_rupees * 100,
    'speed'  => 'normal',
    'notes'  => $notes,
  ];
  if ($receipt !== '') $payload['receipt'] = substr($receipt, 0, 40);

  $url = 'https://api.razorpay.com/v1/payments/' . rawurlencode($payment_id) . '/refund';
  $ch  = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_USERPWD        => $keys['key_id'] . ':' . $keys['key_secret'],
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_TIMEOUT        => 30,
  ]);
  $resp = curl_exec($ch);
  $http = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err  = curl_error($ch);
  curl_close($ch);

  if ($resp === false) return ['ok'=>false, 'error'=>'curl: ' . $err, 'http'=>$http, 'refund_id'=>null];
  $data = json_decode($resp, true);
  if ($http < 200 || $http >= 300) {
    return ['ok'=>false, 'error'=>($data['error']['description'] ?? ('HTTP '.$http)), 'http'=>$http, 'refund_id'=>null];
  }
  return ['ok'=>true, 'refund_id'=>(string)($data['id'] ?? ''), 'http'=>$http, 'error'=>null];
}
