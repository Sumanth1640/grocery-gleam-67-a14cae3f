<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_body();
$restaurant_id = trim((string)($in['restaurant_id'] ?? ''));
if (!$restaurant_id) json_error('restaurant_id required');

// Pick an active outlet for this restaurant so food orders are attributed to
// the correct restaurant/outlet and can reach partner dashboards.
$stmt = db()->prepare('SELECT id, name, area, pincode, eta_mins
  FROM partner_outlets
  WHERE restaurant_id = ? AND is_active = 1
  ORDER BY is_open DESC, sort_order ASC, name ASC
  LIMIT 1');
$stmt->execute([$restaurant_id]);
$out = $stmt->fetch();
json_ok(['outlet' => $out ?: null]);
