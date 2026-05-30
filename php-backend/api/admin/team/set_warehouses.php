<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$uid = (string)($b['user_id'] ?? '');
$wids = $b['warehouse_ids'] ?? [];
if ($uid==='' || !is_array($wids)) json_error('Invalid input');
db()->beginTransaction();
try {
  db()->prepare('DELETE FROM warehouse_managers WHERE user_id=?')->execute([$uid]);
  $st = db()->prepare('INSERT IGNORE INTO warehouse_managers (id,warehouse_id,user_id) VALUES (?,?,?)');
  foreach ($wids as $w) { $st->execute([uuid_v4(),(string)$w,$uid]); }
  db()->commit();
} catch (Throwable $e) { db()->rollBack(); throw $e; }
json_ok(['ok'=>true]);
