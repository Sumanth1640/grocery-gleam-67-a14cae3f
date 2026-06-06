<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
$cat = isset($_GET['category']) ? trim((string)$_GET['category']) : '';
if ($cat !== '' && $cat !== 'all') {
  $st = db()->prepare('SELECT * FROM furniture_items WHERE is_active=1 AND category=? ORDER BY sort_order ASC, created_at ASC');
  $st->execute([$cat]);
} else {
  $st = db()->query('SELECT * FROM furniture_items WHERE is_active=1 ORDER BY sort_order ASC, created_at ASC');
}
$rows = $st->fetchAll();
foreach ($rows as &$r) {
  $r['price'] = (float)$r['price'];
  $r['mrp'] = (float)$r['mrp'];
  $r['is_active'] = (bool)$r['is_active'];
  $r['sort_order'] = (int)$r['sort_order'];
}
json_ok($rows);
