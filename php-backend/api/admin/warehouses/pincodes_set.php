<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$wid = (string)($b['warehouse_id'] ?? '');
$pincodes = is_array($b['pincodes'] ?? null) ? $b['pincodes'] : [];
if ($wid === '') json_error('Missing warehouse_id');
$clean = [];
foreach ($pincodes as $p) {
  $p = trim((string)$p);
  if (preg_match('/^\d{4,8}$/', $p)) $clean[] = $p;
}
$db = db();
$db->beginTransaction();
try {
  $db->prepare('DELETE FROM warehouse_pincodes WHERE warehouse_id=?')->execute([$wid]);
  if ($clean) {
    $ins = $db->prepare('INSERT INTO warehouse_pincodes (id,warehouse_id,pincode,priority) VALUES (?,?,?,0)');
    foreach ($clean as $p) $ins->execute([uuid_v4(), $wid, $p]);
  }
  $db->commit();
} catch (Throwable $e) {
  $db->rollBack();
  json_error('Failed: '.$e->getMessage());
}
json_ok(['ok'=>true]);
