<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_body();
$pincode = trim((string)($in['pincode'] ?? ''));
if (!preg_match('/^\d{4,8}$/', $pincode)) json_error('valid pincode required');

// PHP backend has no warehouses table — return "serviceable" by default
// so the checkout flow proceeds. Plug in real serviceability logic later
// (e.g. lookup table or distance computation).
json_ok([
  'serviceable' => true,
  'warehouse'   => null,
]);
