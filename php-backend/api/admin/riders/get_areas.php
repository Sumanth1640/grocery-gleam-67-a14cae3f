<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$rider_id = (string)($b['rider_id'] ?? '');
if ($rider_id === '') json_error('Missing rider_id');
$o = db()->prepare('SELECT outlet_id FROM rider_outlets WHERE rider_id = ?');
$o->execute([$rider_id]);
$p = db()->prepare('SELECT pincode FROM rider_pincodes WHERE rider_id = ?');
$p->execute([$rider_id]);
json_ok([
  'outlet_ids' => $o->fetchAll(PDO::FETCH_COLUMN),
  'pincodes'   => $p->fetchAll(PDO::FETCH_COLUMN),
]);
