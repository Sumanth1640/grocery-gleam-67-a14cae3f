<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
$me_id = require_admin();
$uid = (string)(json_body()['user_id'] ?? '');
if ($uid==='') json_error('Missing user_id');
if ($uid === $me_id) json_error('You cannot revoke your own admin role.');
$cnt = (int)db()->query("SELECT COUNT(*) FROM user_roles WHERE role='admin'")->fetchColumn();
if ($cnt <= 1) json_error('At least one admin must remain.');
db()->prepare("DELETE FROM user_roles WHERE user_id=? AND role='admin'")->execute([$uid]);
json_ok(['ok'=>true]);
