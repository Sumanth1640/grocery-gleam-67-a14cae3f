<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_body();
$restaurant_id = trim((string)($in['restaurant_id'] ?? ''));
if (!$restaurant_id) json_error('restaurant_id required');

$pincode = preg_replace('/\D+/', '', (string)($in['pincode'] ?? ''));

// 1) Prefer an active outlet whose pincode exactly matches the customer's pincode.
if ($pincode !== '') {
  $stmt = db()->prepare('SELECT id, name, area, pincode, eta_mins
    FROM partner_outlets
    WHERE restaurant_id = ? AND is_active = 1
      AND REPLACE(TRIM(pincode), " ", "") = ?
    ORDER BY is_open DESC, sort_order ASC, name ASC
    LIMIT 1');
  $stmt->execute([$restaurant_id, $pincode]);
  $out = $stmt->fetch();
  if ($out) json_ok(['outlet' => $out]);
}

// 2) Fallback: any active outlet for this restaurant (legacy behavior).
$stmt = db()->prepare('SELECT id, name, area, pincode, eta_mins
  FROM partner_outlets
  WHERE restaurant_id = ? AND is_active = 1
  ORDER BY is_open DESC, sort_order ASC, name ASC
  LIMIT 1');
$stmt->execute([$restaurant_id]);
$out = $stmt->fetch();
json_ok(['outlet' => $out ?: null]);
