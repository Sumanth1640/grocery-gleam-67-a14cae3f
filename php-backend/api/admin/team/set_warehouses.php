<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$uid = (string)($b['user_id'] ?? '');
$wids = $b['warehouse_ids'] ?? [];
if ($uid==='' || !is_array($wids)) json_error('Invalid input');

$existing = db()->prepare('SELECT id, warehouse_id FROM warehouse_managers WHERE user_id=?');
$existing->execute([$uid]);
$have = []; foreach ($existing->fetchAll() as $r) $have[$r['warehouse_id']] = $r['id'];

$want = array_values(array_unique(array_map('strval', $wids)));
$toAdd = array_values(array_diff($want, array_keys($have)));
$toRemoveIds = [];
foreach ($have as $wid => $id) if (!in_array($wid, $want, true)) $toRemoveIds[] = $id;

db()->beginTransaction();
try {
  if ($toRemoveIds) {
    $ph = implode(',', array_fill(0, count($toRemoveIds), '?'));
    db()->prepare("DELETE FROM warehouse_managers WHERE id IN ($ph)")->execute($toRemoveIds);
  }
  if ($toAdd) {
    $st = db()->prepare('INSERT IGNORE INTO warehouse_managers (id,warehouse_id,user_id) VALUES (?,?,?)');
    foreach ($toAdd as $w) $st->execute([uuid_v4(), (string)$w, $uid]);
  }
  db()->commit();
} catch (Throwable $e) { db()->rollBack(); throw $e; }

json_ok(['ok'=>true, 'added'=>count($toAdd), 'removed'=>count($toRemoveIds)]);
