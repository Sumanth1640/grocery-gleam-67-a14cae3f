<?php
require __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$in  = json_body();

$amount = (int)($in['amount'] ?? 0); // in paise
if ($amount < 100) json_error('amount (in paise) >= 100 required');

$rzp = razorpay_keys();
$key_id     = $rzp['key_id'];
$key_secret = $rzp['key_secret'];
if (!$key_id || !$key_secret) json_error('Razorpay ' . $rzp['mode'] . ' keys not configured on server', 500);

$payload = json_encode([
  'amount'   => $amount,
  'currency' => 'INR',
  'receipt'  => 'rcpt_' . substr(uuid_v4(), 0, 18),
  'notes'    => ['user_id' => $uid],
]);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST           => true,
  CURLOPT_POSTFIELDS     => $payload,
  CURLOPT_USERPWD        => $key_id . ':' . $key_secret,
  CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
  CURLOPT_TIMEOUT        => 15,
]);
$res  = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code < 200 || $code >= 300) json_error('Razorpay error: ' . $res, 502);

$data = json_decode($res, true);
json_ok([
  'order_id' => $data['id'],
  'amount'   => $data['amount'],
  'currency' => $data['currency'],
  'key_id'   => $key_id, // safe — publishable on Razorpay checkout
]);
