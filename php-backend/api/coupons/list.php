<?php
require __DIR__ . '/../../config.php';
require_method('GET');

$stmt = db()->query('
  SELECT code, title, description, discount_type, discount_value, min_order, max_discount, expires_at
  FROM coupons
  WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 50
');
$rows = array_map(function ($r) {
  $r['discount_value'] = (int)$r['discount_value'];
  $r['min_order']      = (int)$r['min_order'];
  $r['max_discount']   = $r['max_discount'] !== null ? (int)$r['max_discount'] : null;
  return $r;
}, $stmt->fetchAll());
json_ok($rows);
