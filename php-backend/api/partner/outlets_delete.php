<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$id = (string)(json_body()['id'] ?? '');
if (!$id) json_error('id required');
$s = db()->prepare('SELECT restaurant_id FROM partner_outlets WHERE id = ?');
$s->execute([$id]);
$o = $s->fetch();
if (!$o) json_error('Outlet not found', 404);
ensure_owns_restaurant($uid, $o['restaurant_id']);
db()->prepare('DELETE FROM partner_outlets WHERE id = ?')->execute([$id]);
json_ok(['ok' => true]);
