<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$wid = (string)(json_body()['warehouse_id'] ?? '');
if ($wid === '') json_error('Missing warehouse_id');
$st = db()->prepare('SELECT * FROM warehouse_pincodes WHERE warehouse_id=? ORDER BY priority DESC, pincode ASC');
$st->execute([$wid]);
json_ok($st->fetchAll());
