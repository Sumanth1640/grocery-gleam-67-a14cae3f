<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$r = partner_my_restaurant($uid);
if (!$r) json_error('Not found', 404);
$b = json_body();
$id = (string)($b['id'] ?? '');
$inStock = !empty($b['in_stock']) ? 1 : 0;
if (!$id) json_error('id required');
$stmt = db()->prepare('UPDATE partner_dishes SET in_stock = ? WHERE id = ? AND restaurant_id = ?');
$stmt->execute([$inStock, $id, $r['id']]);
json_ok(['ok' => true]);
