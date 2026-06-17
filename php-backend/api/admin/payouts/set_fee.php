<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$fee = isset($b['fee']) ? (float)$b['fee'] : -1;
if ($fee < 0 || $fee > 10000) json_error('Invalid fee');
db()->prepare(
  "INSERT INTO app_settings (`key`, `value`) VALUES ('rider_flat_fee', ?)
   ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)"
)->execute([(string)$fee]);
json_ok(['ok' => true]);
