<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$q = trim((string)(json_body()['q'] ?? ''));
if ($q !== '') {
  $st = db()->prepare("SELECT id, full_name, phone, avatar_url, is_blocked, created_at, email FROM users
                       WHERE full_name LIKE ? OR phone LIKE ? OR email LIKE ?
                       ORDER BY created_at DESC LIMIT 200");
  $like = "%$q%"; $st->execute([$like, $like, $like]);
} else {
  $st = db()->query("SELECT id, full_name, phone, avatar_url, is_blocked, created_at, email FROM users ORDER BY created_at DESC LIMIT 200");
}
$users = $st->fetchAll();
$ids = array_column($users, 'id');
$roles = []; $stats = [];
if ($ids) {
  $ph = implode(',', array_fill(0, count($ids), '?'));
  $st = db()->prepare("SELECT user_id, role FROM user_roles WHERE user_id IN ($ph)");
  $st->execute($ids);
  foreach ($st->fetchAll() as $r) { $roles[$r['user_id']][] = $r['role']; }
  $st = db()->prepare("SELECT user_id, total, status FROM orders WHERE user_id IN ($ph)");
  $st->execute($ids);
  foreach ($st->fetchAll() as $o) {
    if ($o['status']==='cancelled') continue;
    $s = $stats[$o['user_id']] ?? ['orders'=>0,'spent'=>0];
    $s['orders']++; $s['spent'] += (int)$o['total'];
    $stats[$o['user_id']] = $s;
  }
}
foreach ($users as &$u) {
  $u['is_blocked'] = (bool)$u['is_blocked'];
  $u['roles']  = $roles[$u['id']] ?? [];
  $u['orders'] = $stats[$u['id']]['orders'] ?? 0;
  $u['spent']  = $stats[$u['id']]['spent'] ?? 0;
}
json_ok($users);
