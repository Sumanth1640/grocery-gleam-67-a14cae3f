<?php
require __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../order_helpers.php';
require_method('POST');

$in = json_body();
$pincode = trim((string)($in['pincode'] ?? ''));
if (!preg_match('/^\d{4,8}$/', $pincode)) json_error('valid pincode required');

$warehouseId = resolve_warehouse_id_for_address(['pincode' => $pincode]);
if (!$warehouseId) {
  json_ok(['serviceable' => false, 'warehouse' => null]);
}

$st = db()->prepare('SELECT id, name, code, city, pincode FROM warehouses WHERE id = ? LIMIT 1');
$st->execute([$warehouseId]);
json_ok([
  'serviceable' => true,
  'warehouse'   => $st->fetch() ?: null,
]);
