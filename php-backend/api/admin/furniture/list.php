<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM furniture_items ORDER BY sort_order ASC, created_at ASC')->fetchAll();
foreach ($rows as &$r) {
  $r['price'] = (float)$r['price'];
  $r['mrp'] = (float)$r['mrp'];
  $r['is_active'] = (bool)$r['is_active'];
  $r['sort_order'] = (int)$r['sort_order'];
}
json_ok($rows);
