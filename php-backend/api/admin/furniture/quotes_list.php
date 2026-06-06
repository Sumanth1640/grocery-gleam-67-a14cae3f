<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query('SELECT * FROM furniture_quotes ORDER BY created_at DESC LIMIT 500')->fetchAll();
foreach ($rows as &$r) {
  $r['total'] = (float)$r['total'];
  $r['items'] = json_decode($r['items'] ?? '[]', true);
}
json_ok($rows);
