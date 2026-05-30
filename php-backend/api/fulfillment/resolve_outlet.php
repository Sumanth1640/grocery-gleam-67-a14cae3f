<?php
require __DIR__ . '/../../config.php';
require_method('POST');

$in = json_body();
$restaurant_id = trim((string)($in['restaurant_id'] ?? ''));
if (!$restaurant_id) json_error('restaurant_id required');

// Simple fallback: pick the first active outlet. The PHP schema has no
// per-restaurant outlet mapping, so we just return the first outlet (or null).
$stmt = db()->prepare('SELECT id, name, address as area, pincode, 30 as eta_mins FROM outlets WHERE is_active = 1 ORDER BY name LIMIT 1');
$stmt->execute();
$out = $stmt->fetch();
json_ok(['outlet' => $out ?: null]);
