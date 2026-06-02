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

// ---------- Resolve warehouse from the delivery pincode ----------
$warehouseId = resolve_warehouse_id_for_address($address);

$id = uuid_v4();
try {
  db()->prepare('
    INSERT INTO orders (id, user_id, warehouse_id, items, address, payment, subtotal, delivery, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ')->execute([
    $id, $uid, $warehouseId,
    json_encode($items, JSON_UNESCAPED_UNICODE),
    json_encode($address, JSON_UNESCAPED_UNICODE),
    $payment, $subtotal, (int)$delivery, $total,
  ]);
} catch (Throwable $e) {
  // Fallback for installs that haven't run schema_phase4 (no warehouse_id column yet)
  db()->prepare('
    INSERT INTO orders (id, user_id, items, address, payment, subtotal, delivery, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ')->execute([
    $id, $uid,
    json_encode($items, JSON_UNESCAPED_UNICODE),
    json_encode($address, JSON_UNESCAPED_UNICODE),
    $payment, $subtotal, (int)$delivery, $total,
  ]);
}

// ---------- Notify the customer ----------
notify_user($uid, 'order', 'Order placed',
  'Your order of ₹'.$total.' has been placed successfully.',
  '/orders/'.$id);

// ---------- Notify warehouse managers ----------
notify_warehouse_managers_for_order($warehouseId, (int)$total, $id);

json_ok(['id' => $id, 'status' => 'placed', 'warehouse_id' => $warehouseId], 201);
