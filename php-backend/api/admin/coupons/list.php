<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM coupons ORDER BY created_at DESC')->fetchAll();
foreach ($rows as &$r) {
  $r['is_active']      = (bool)$r['is_active'];
  $r['discount_value'] = (int)$r['discount_value'];
  $r['min_order']      = (int)$r['min_order'];
  if ($r['max_discount']   !== null) $r['max_discount']   = (int)$r['max_discount'];
  if ($r['usage_limit']    !== null) $r['usage_limit']    = (int)$r['usage_limit'];
  if ($r['per_user_limit'] !== null) $r['per_user_limit'] = (int)$r['per_user_limit'];
  $r['used_count']     = (int)($r['used_count'] ?? 0);
}
json_ok($rows);
