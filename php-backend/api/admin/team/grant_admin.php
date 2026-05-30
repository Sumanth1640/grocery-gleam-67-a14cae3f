<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$id = (string)(json_body()['user_id'] ?? '');
if ($id==='') json_error('Missing user_id');
db()->prepare('INSERT IGNORE INTO user_roles (id,user_id,role) VALUES (?,?,?)')->execute([uuid_v4(),$id,'admin']);
json_ok(['ok'=>true]);
