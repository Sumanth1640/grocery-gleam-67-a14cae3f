<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$uid = current_user_id();
$id  = $_GET['id'] ?? null;
if (!$id) json_error('id required');

$stmt = db()->prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?');
$stmt->execute([$id, $uid]);
$row = $stmt->fetch();
if (!$row) json_error('Order not found', 404);

$row['items']    = json_decode($row['items'], true);
$row['address']  = json_decode($row['address'], true);
$row['subtotal'] = (int)$row['subtotal'];
$row['delivery'] = (int)$row['delivery'];
$row['total']    = (int)$row['total'];
if (isset($row['created_at'])) $row['created_at'] = to_iso_utc($row['created_at']);

json_ok($row);
