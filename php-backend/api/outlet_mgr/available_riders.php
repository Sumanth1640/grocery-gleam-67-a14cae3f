<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$outlet_id = (string)($b['outlet_id'] ?? '');
$pincode   = isset($b['delivery_pincode']) && preg_match('/^\d{6}$/', (string)$b['delivery_pincode']) ? (string)$b['delivery_pincode'] : null;
if ($outlet_id === '') json_error('Missing outlet_id');
if (!manages_outlet($uid, $outlet_id)) json_error('Not your outlet', 403);

// Riders linked to this outlet, approved & active
$st = db()->prepare(
  "SELECT r.id, r.name, r.phone, r.vehicle, r.vehicle_no, r.is_active, r.status
     FROM riders r
     JOIN rider_outlets ro ON ro.rider_id = r.id
    WHERE ro.outlet_id = ? AND r.status = 'approved' AND r.is_active = 1"
);
$st->execute([$outlet_id]);
$riders = $st->fetchAll();
if (!$riders) { json_ok([]); }

$ids = array_column($riders, 'id');
$ph  = implode(',', array_fill(0, count($ids), '?'));

// Active load
$load = [];
$st = db()->prepare("SELECT rider_id, COUNT(*) AS c FROM order_assignments
                     WHERE rider_id IN ($ph) AND status IN ('assigned','picked_up')
                     GROUP BY rider_id");
$st->execute($ids);
foreach ($st->fetchAll() as $row) { $load[$row['rider_id']] = (int)$row['c']; }

// Pincode match
$pinMatch = [];
if ($pincode) {
  $st = db()->prepare("SELECT rider_id FROM rider_pincodes WHERE rider_id IN ($ph) AND pincode = ?");
  $st->execute([...$ids, $pincode]);
  foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $rid) { $pinMatch[$rid] = true; }
}

foreach ($riders as &$r) {
  $r['is_active']     = (bool)$r['is_active'];
  $r['active_orders'] = $load[$r['id']] ?? 0;
  $r['pincode_match'] = !empty($pinMatch[$r['id']]);
}
usort($riders, function ($a, $b) {
  if ($a['pincode_match'] !== $b['pincode_match']) return $a['pincode_match'] ? -1 : 1;
  return $a['active_orders'] - $b['active_orders'];
});
json_ok($riders);
