<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM products ORDER BY created_at DESC')->fetchAll();
foreach ($rows as &$r) $r['in_stock'] = (bool)$r['in_stock'];
json_ok($rows);
