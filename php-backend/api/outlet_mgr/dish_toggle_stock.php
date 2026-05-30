<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$id = (string)($b['id'] ?? '');
$in_stock = !empty($b['in_stock']) ? 1 : 0;
if (!$id) json_error('id required');
$chk = db()->prepare('SELECT 1 FROM partner_dishes d
  JOIN partner_outlet_managers m ON m.outlet_id = d.outlet_id
  WHERE d.id = ? AND m.user_id = ?');
$chk->execute([$id, $uid]);
if (!$chk->fetch()) json_error('Not your dish', 403);
db()->prepare('UPDATE partner_dishes SET in_stock = ? WHERE id = ?')->execute([$in_stock, $id]);
json_ok(['ok' => true]);
