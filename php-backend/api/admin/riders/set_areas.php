<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$rider_id = (string)($b['rider_id'] ?? '');
$outlets  = is_array($b['outlet_ids'] ?? null) ? $b['outlet_ids'] : [];
$pins     = is_array($b['pincodes']   ?? null) ? $b['pincodes']   : [];
if ($rider_id === '') json_error('Missing rider_id');

db()->beginTransaction();
try {
  db()->prepare('DELETE FROM rider_outlets  WHERE rider_id = ?')->execute([$rider_id]);
  db()->prepare('DELETE FROM rider_pincodes WHERE rider_id = ?')->execute([$rider_id]);
  if ($outlets) {
    $ins = db()->prepare('INSERT INTO rider_outlets (rider_id, outlet_id) VALUES (?, ?)');
    foreach ($outlets as $oid) if (is_string($oid) && $oid !== '') $ins->execute([$rider_id, $oid]);
  }
  if ($pins) {
    $ins = db()->prepare('INSERT INTO rider_pincodes (rider_id, pincode) VALUES (?, ?)');
    foreach (array_unique($pins) as $p) {
      if (is_string($p) && preg_match('/^\d{6}$/', $p)) $ins->execute([$rider_id, $p]);
    }
  }
  db()->commit();
} catch (Throwable $e) { db()->rollBack(); json_error('Failed: ' . $e->getMessage(), 500); }
json_ok(['ok' => true]);
