<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$st = db()->query("SELECT `value` FROM app_settings WHERE `key` = 'rider_flat_fee' LIMIT 1");
$v = $st->fetchColumn();
json_ok(['fee' => $v === false || $v === null || $v === '' ? 40 : (float)$v]);
