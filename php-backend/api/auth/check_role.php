<?php
require_once __DIR__ . '/../../config.php';
require_method('GET');

$uid = current_user_id();

$admin = (bool) db()->prepare('SELECT 1 FROM user_roles WHERE user_id = ? AND role = ? LIMIT 1')
  ->execute([$uid, 'admin'])
  ->fetchColumn();

$whIds = db()->prepare('SELECT warehouse_id FROM warehouse_managers WHERE user_id = ?')
  ->execute([$uid])
  ->fetchAll(PDO::FETCH_COLUMN) ?: [];

json_ok([
  'isAdmin' => $admin,
  'isWarehouseManager' => !empty($whIds),
  'warehouseIds' => array_values($whIds),
]);
