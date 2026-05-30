<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$outlet_id = (string)($b['outlet_id'] ?? '');
$email = strtolower(trim((string)($b['email'] ?? '')));
$role = in_array($b['role'] ?? 'manager', ['manager','cashier'], true) ? $b['role'] : 'manager';
if (!$outlet_id || !$email) json_error('outlet_id and email required');
$o = db()->prepare('SELECT id, restaurant_id FROM partner_outlets WHERE id = ?');
$o->execute([$outlet_id]);
$out = $o->fetch();
if (!$out) json_error('Outlet not found', 404);
ensure_owns_restaurant($uid, $out['restaurant_id']);
$u = db()->prepare('SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1');
$u->execute([$email]);
$user = $u->fetch();
if (!$user) json_error('No user with that email. They must sign up first.');
try {
  $ins = db()->prepare('INSERT INTO partner_outlet_managers (id, restaurant_id, outlet_id, user_id, role, created_at) VALUES (?,?,?,?,?,NOW())');
  $ins->execute([uuid_v4(), $out['restaurant_id'], $outlet_id, $user['id'], $role]);
} catch (PDOException $e) {
  if (str_contains($e->getMessage(), 'Duplicate')) json_error('Already a manager of this outlet.');
  throw $e;
}
json_ok(['ok' => true]);
