<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['id'] ?? '');
$blocked = !empty($b['blocked']) ? 1 : 0;
if ($id==='') json_error('Missing id');
db()->prepare('UPDATE partner_restaurants SET is_blocked=? WHERE id=?')->execute([$blocked,$id]);
json_ok(['ok'=>true,'blocked'=>(bool)$blocked]);
