<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in       = json_body();
$code     = strtoupper(trim((string)($in['code'] ?? '')));
$subtotal = (int)($in['subtotal'] ?? 0);
if (!$code)     json_error('code required');
if ($subtotal <= 0) json_error('subtotal required');

$stmt = db()->prepare('
  SELECT code, discount_type, discount_value, min_order, max_discount, expires_at, is_active
  FROM coupons WHERE code = ? LIMIT 1
');
$stmt->execute([$code]);
$c = $stmt->fetch();

if (!$c || (int)$c['is_active'] !== 1) json_error('Invalid coupon', 404);
if ($c['expires_at'] && strtotime($c['expires_at']) < time()) json_error('Coupon expired', 410);
if ($subtotal < (int)$c['min_order']) {
  json_error('Minimum order ₹' . $c['min_order'] . ' required', 400);
}

$discount = 0;
if ($c['discount_type'] === 'percent') {
  $discount = (int)floor($subtotal * ((int)$c['discount_value']) / 100);
  if ($c['max_discount'] !== null) $discount = min($discount, (int)$c['max_discount']);
} else { // flat
  $discount = (int)$c['discount_value'];
}
$discount = min($discount, $subtotal);

json_ok([
  'code'     => $c['code'],
  'discount' => $discount,
  'subtotal' => $subtotal,
  'total'    => $subtotal - $discount,
]);
