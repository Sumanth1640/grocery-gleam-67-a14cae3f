<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['user_id'] ?? '');
$blocked = !empty($b['blocked']) ? 1 : 0;
if ($id==='') json_error('Missing user_id');
db()->prepare('UPDATE users SET is_blocked=? WHERE id=?')->execute([$blocked, $id]);
json_ok(['ok' => true, 'blocked' => (bool)$blocked]);
