<?php
require __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';
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
$warehouseId = null;
$pin = trim((string)($address['pincode'] ?? ''));
if (preg_match('/^\d{4,8}$/', $pin)) {
  try {
    $st = db()->prepare(
      'SELECT w.id FROM warehouses w
       JOIN warehouse_pincodes wp ON wp.warehouse_id = w.id
       WHERE w.is_active = 1 AND wp.pincode = ?
       ORDER BY wp.priority DESC
       LIMIT 1'
    );
    $st->execute([$pin]);
    $warehouseId = $st->fetchColumn() ?: null;
  } catch (Throwable $e) { /* ignore — warehouse columns may not exist yet */ }
}

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
if ($warehouseId) {
  try {
    $wname = null;
    $st = db()->prepare('SELECT name FROM warehouses WHERE id=?');
    $st->execute([$warehouseId]); $wname = $st->fetchColumn() ?: null;
    $st = db()->prepare('SELECT user_id FROM warehouse_managers WHERE warehouse_id=?');
    $st->execute([$warehouseId]);
    foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $mgrId) {
      notify_user($mgrId, 'order', 'New product order',
        'A customer placed an order of ₹'.$total.($wname ? ' at '.$wname : '').'.',
        '/admin/orders');
    }
  } catch (Throwable $e) { /* ignore */ }
}

json_ok(['id' => $id, 'status' => 'placed', 'warehouse_id' => $warehouseId], 201);
