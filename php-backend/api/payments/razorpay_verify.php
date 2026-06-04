<?php
// Verify a Razorpay payment signature and persist the order in one step.
// Mirrors verifyAndPlaceOrder() from src/lib/razorpay.functions.ts.
require __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../order_helpers.php';
require_method('POST');

$uid = current_user_id();
$in  = json_body();

$razorpay_order_id   = (string)($in['razorpay_order_id']   ?? '');
$razorpay_payment_id = (string)($in['razorpay_payment_id'] ?? '');
$razorpay_signature  = (string)($in['razorpay_signature']  ?? '');
$order               = $in['order'] ?? null;

if (!$razorpay_order_id || !$razorpay_payment_id || !$razorpay_signature) {
  json_error('Missing razorpay verification fields');
}
if (!is_array($order)) json_error('order payload required');

$secret = razorpay_keys()['key_secret'];
if (!$secret) json_error('Razorpay secret not configured', 500);

$expected = hash_hmac('sha256', $razorpay_order_id . '|' . $razorpay_payment_id, $secret);
if (!hash_equals($expected, $razorpay_signature)) json_error('Invalid signature', 400);

$items    = $order['items']    ?? null;
$address  = $order['address']  ?? null;
$payment  = $order['payment']  ?? null;
$subtotal = $order['subtotal'] ?? null;
$delivery = $order['delivery'] ?? 0;
$total    = $order['total']    ?? null;

if (!is_array($items) || count($items) === 0) json_error('items required');
if (!is_array($address))                       json_error('address required');
if (!in_array($payment, ['upi','card'], true)) json_error('invalid payment');
if (!is_int($subtotal) || !is_int($total))    json_error('subtotal/total must be integers');

$warehouseId  = resolve_warehouse_id_for_address($address);
$restaurantId = isset($order['restaurant_id']) && is_string($order['restaurant_id']) && $order['restaurant_id'] !== '' ? $order['restaurant_id'] : null;
$outletId     = isset($order['outlet_id']) && is_string($order['outlet_id']) && $order['outlet_id'] !== '' ? $order['outlet_id'] : null;

$id = uuid_v4();
insert_order_row($id, $uid, $warehouseId, $restaurantId, $outletId, $items, $address, $payment, (int)$subtotal, (int)$delivery, (int)$total, 'paid');

notify_user($uid, 'order', 'Order placed',
  'Your order of ₹'.$total.' has been placed successfully.',
  '/orders/'.$id);
notify_warehouse_managers_for_order($warehouseId, (int)$total, $id);
notify_partner_for_order($restaurantId, (int)$total, $id);

json_ok(['id' => $id, 'created_at' => date('c'), 'warehouse_id' => $warehouseId, 'restaurant_id' => $restaurantId], 201);
