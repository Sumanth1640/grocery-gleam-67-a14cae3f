<?php
require __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';
require_once __DIR__ . '/../../order_helpers.php';
require_method('POST');

$uid = current_user_id();
$in  = json_body();

$items    = $in['items']    ?? null;
$address  = $in['address']  ?? null;
$payment  = $in['payment']  ?? null;
$subtotal = $in['subtotal'] ?? null;
$delivery = $in['delivery'] ?? 0;
$total    = $in['total']    ?? null;

if (!is_array($items) || count($items) === 0) json_error('items required');
if (!is_array($address))                       json_error('address required');
if (!in_array($payment, ['upi','card','cod'], true)) json_error('invalid payment');
if (!is_int($subtotal) || !is_int($total))    json_error('subtotal/total must be integers');

$restaurantId = isset($in['restaurant_id']) && is_string($in['restaurant_id']) && $in['restaurant_id'] !== '' ? $in['restaurant_id'] : null;
$outletId     = isset($in['outlet_id']) && is_string($in['outlet_id']) && $in['outlet_id'] !== '' ? $in['outlet_id'] : null;

// Only resolve a warehouse for grocery/product orders. Restaurant orders are
// routed to the restaurant's outlet — they must NEVER carry a warehouse_id,
// otherwise warehouse managers see food orders in their dashboard.
$warehouseId  = $restaurantId ? null : resolve_warehouse_id_for_address($address);

$id = uuid_v4();
insert_order_row($id, $uid, $warehouseId, $restaurantId, $outletId, $items, $address, $payment, (int)$subtotal, (int)$delivery, (int)$total, null);

// ---------- Notify the customer ----------
notify_user($uid, 'order', 'Order placed',
  'Your order of ₹'.$total.' has been placed successfully.',
  '/orders/'.$id);

// ---------- Notify warehouse managers / partner ----------
if (!$restaurantId) {
  notify_warehouse_managers_for_order($warehouseId, (int)$total, $id);
}
notify_partner_for_order($restaurantId, (int)$total, $id, $outletId);

json_ok(['id' => $id, 'created_at' => date('c'), 'status' => 'placed', 'warehouse_id' => $warehouseId, 'restaurant_id' => $restaurantId, 'outlet_id' => $outletId], 201);
