<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC')->fetchAll();
foreach ($rows as &$r) $r['is_active'] = (bool)$r['is_active'];
json_ok($rows);
