<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
$uid = require_admin();
$id = (string)(json_body()['user_id'] ?? '');
if ($id==='') json_error('Missing user_id');
if ($id === $uid) json_error('Cannot revoke your own admin role', 400);
db()->prepare('DELETE FROM user_roles WHERE user_id=? AND role=?')->execute([$id,'admin']);
json_ok(['ok'=>true]);
