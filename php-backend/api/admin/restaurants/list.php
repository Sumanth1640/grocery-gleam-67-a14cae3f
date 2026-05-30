<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM partner_restaurants ORDER BY created_at DESC')->fetchAll();
foreach ($rows as &$r) {
  $r['cuisines']   = json_decode($r['cuisines'] ?? '[]', true) ?: [];
  $r['veg']        = (bool)$r['veg'];
  $r['is_open']    = (bool)$r['is_open'];
  $r['is_blocked'] = (bool)$r['is_blocked'];
}
json_ok($rows);
