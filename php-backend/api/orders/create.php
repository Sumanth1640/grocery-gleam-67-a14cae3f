<?php
require __DIR__ . '/../../config.php';
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

$id = uuid_v4();
db()->prepare('
  INSERT INTO orders (id, user_id, items, address, payment, subtotal, delivery, total)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
')->execute([
  $id, $uid,
  json_encode($items, JSON_UNESCAPED_UNICODE),
  json_encode($address, JSON_UNESCAPED_UNICODE),
  $payment, $subtotal, (int)$delivery, $total,
]);

json_ok(['id' => $id, 'status' => 'placed'], 201);
