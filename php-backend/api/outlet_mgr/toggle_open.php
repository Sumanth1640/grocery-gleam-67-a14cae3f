<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$outlet_id = (string)($b['outlet_id'] ?? '');
$is_open = !empty($b['is_open']) ? 1 : 0;
$m = db()->prepare('SELECT 1 FROM partner_outlet_managers WHERE user_id = ? AND outlet_id = ?');
$m->execute([$uid, $outlet_id]);
if (!$m->fetch()) json_error('Not your outlet', 403);
db()->prepare('UPDATE partner_outlets SET is_open = ? WHERE id = ?')->execute([$is_open, $outlet_id]);
json_ok(['ok' => true]);
