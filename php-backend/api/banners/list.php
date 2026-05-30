<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');
$rows = db()->query('SELECT * FROM banners WHERE is_active=1 ORDER BY sort_order ASC')->fetchAll();
foreach ($rows as &$r) $r['is_active'] = (bool)$r['is_active'];
json_ok($rows);
