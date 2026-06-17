<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$rows = db()->query(
  "SELECT * FROM riders WHERE status = 'pending' ORDER BY created_at DESC"
)->fetchAll();
foreach ($rows as &$r) {
  $r['is_active'] = (bool)$r['is_active'];
  $r['preferred_outlets']  = $r['preferred_outlets']  ? json_decode($r['preferred_outlets'],  true) : [];
  $r['preferred_pincodes'] = $r['preferred_pincodes'] ? json_decode($r['preferred_pincodes'], true) : [];
}
json_ok($rows);
