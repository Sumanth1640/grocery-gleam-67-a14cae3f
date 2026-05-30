<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = (string)($b['user_id'] ?? '');
$role = (string)($b['role'] ?? '');
$grant = !empty($b['grant']);
if ($id==='' || !in_array($role, ['admin','moderator','user'], true)) json_error('Invalid input');
if ($grant) {
  db()->prepare('INSERT IGNORE INTO user_roles (id,user_id,role) VALUES (?,?,?)')->execute([uuid_v4(),$id,$role]);
} else {
  db()->prepare('DELETE FROM user_roles WHERE user_id=? AND role=?')->execute([$id,$role]);
}
json_ok(['ok'=>true]);
