<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$open = !empty($b['is_open']) ? 1 : 0;
$u = db()->prepare('UPDATE partner_restaurants SET is_open = ? WHERE owner_id = ?');
$u->execute([$open, $uid]);
json_ok(['ok' => true]);
