<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();

$whs = db()->query('SELECT id, name, code, city FROM warehouses ORDER BY sort_order ASC, name ASC')->fetchAll();
$whMap = []; foreach ($whs as $w) $whMap[$w['id']] = $w;

// Exclude restaurant partners (owners of restaurants/partner_restaurants) so
// they don't appear in the admin team table — unless they are also admins or
// warehouse managers.
$restaurantOwnersExists = false;
try {
  $restaurantOwnersExists = (bool) db()->query("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('restaurants','partner_restaurants') LIMIT 1")->fetchColumn();
} catch (Throwable $e) { $restaurantOwnersExists = false; }

$ownerUnion = [];
try { if ((bool) db()->query("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name='restaurants' LIMIT 1")->fetchColumn()) $ownerUnion[] = "SELECT owner_id FROM restaurants WHERE owner_id IS NOT NULL"; } catch (Throwable $e) {}
try { if ((bool) db()->query("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name='partner_restaurants' LIMIT 1")->fetchColumn()) $ownerUnion[] = "SELECT owner_id FROM partner_restaurants WHERE owner_id IS NOT NULL"; } catch (Throwable $e) {}
$excludeOwners = $ownerUnion ? "AND u.id NOT IN (" . implode(' UNION ', $ownerUnion) . ")" : '';

$sql = "SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.created_at,
               GROUP_CONCAT(DISTINCT ur.role) AS roles
        FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id
        WHERE (ur.role IS NOT NULL
           OR u.id IN (SELECT user_id FROM warehouse_managers))
           $excludeOwners
        GROUP BY u.id ORDER BY u.created_at DESC";
$users = db()->query($sql)->fetchAll();

$mgrSt = db()->query('SELECT id, user_id, warehouse_id FROM warehouse_managers');
$byUser = [];
foreach ($mgrSt->fetchAll() as $m) {
  $byUser[$m['user_id']][] = [
    'assignment_id' => $m['id'],
    'warehouse_id'  => $m['warehouse_id'],
    'name'          => $whMap[$m['warehouse_id']]['name'] ?? '—',
    'code'          => $whMap[$m['warehouse_id']]['code'] ?? '',
  ];
}

$out = [];
foreach ($users as $u) {
  $roles = $u['roles'] ? explode(',', $u['roles']) : [];
  $out[] = [
    'user_id'   => $u['id'],
    'email'     => $u['email'],
    'full_name' => $u['full_name'],
    'phone'     => $u['phone'],
    'is_admin'  => in_array('admin', $roles, true),
    'warehouses'=> $byUser[$u['id']] ?? [],
  ];
}
usort($out, function($a,$b){
  if ($a['is_admin'] !== $b['is_admin']) return $a['is_admin'] ? -1 : 1;
  return strcasecmp(($a['full_name'] ?? $a['email'] ?? ''), ($b['full_name'] ?? $b['email'] ?? ''));
});

json_ok(['users' => $out, 'warehouses' => $whs]);
