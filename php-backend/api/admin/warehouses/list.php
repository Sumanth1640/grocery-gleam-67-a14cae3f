<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM warehouses ORDER BY sort_order ASC, created_at ASC')->fetchAll();
foreach ($rows as &$r) {
  $r['is_active']  = (bool)$r['is_active'];
  $r['sort_order'] = (int)$r['sort_order'];
  $r['lat'] = $r['lat'] !== null ? (float)$r['lat'] : null;
  $r['lng'] = $r['lng'] !== null ? (float)$r['lng'] : null;
}
json_ok($rows);
