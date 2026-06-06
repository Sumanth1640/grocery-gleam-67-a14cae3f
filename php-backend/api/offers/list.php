<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
$rows = db()->query('SELECT * FROM offer_tiles WHERE is_active=1 ORDER BY sort_order ASC, created_at ASC')->fetchAll();
foreach ($rows as &$r) { $r['is_active'] = (bool)$r['is_active']; $r['sort_order'] = (int)$r['sort_order']; }
json_ok($rows);
