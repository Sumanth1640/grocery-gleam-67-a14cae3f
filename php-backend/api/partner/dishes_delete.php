<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_error('Not found', 404);
$id = (string)(json_body()['id'] ?? '');
if (!$id) json_error('id required');
$stmt = db()->prepare('DELETE FROM partner_dishes WHERE id = ? AND restaurant_id = ?');
$stmt->execute([$id, $r['id']]);
json_ok(['ok' => true]);
