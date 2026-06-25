<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$warehouse_id = (string)($b['warehouse_id'] ?? '');
$pincode = isset($b['delivery_pincode']) && preg_match('/^\d{4,8}$/', (string)$b['delivery_pincode'])
  ? (string)$b['delivery_pincode'] : null;
if ($warehouse_id === '') json_error('Missing warehouse_id');
if (!manages_warehouse($uid, $warehouse_id)) json_error('Not your warehouse', 403);

// Pincodes served by this warehouse
$st = db()->prepare('SELECT pincode FROM warehouse_pincodes WHERE warehouse_id = ?');
$st->execute([$warehouse_id]);
$whPins = $st->fetchAll(PDO::FETCH_COLUMN) ?: [];

// Riders covering any of the warehouse pincodes (approved + active + not busy)
$riders = [];
if ($whPins) {
  $ph = implode(',', array_fill(0, count($whPins), '?'));
  $st = db()->prepare(
    "SELECT DISTINCT r.id, r.name, r.phone, r.vehicle, r.vehicle_no, r.is_active, r.status
       FROM riders r
       JOIN rider_pincodes rp ON rp.rider_id = r.id
      WHERE rp.pincode IN ($ph) AND r.status = 'approved' AND r.is_active = 1
        AND NOT EXISTS (
          SELECT 1 FROM order_assignments a
           WHERE a.rider_id = r.id AND a.status IN ('assigned','picked_up')
        )"
  );
  $st->execute($whPins);
  $riders = $st->fetchAll();
}

if (!$riders) {
  // Fallback: any approved + active + free rider (warehouse may not have pincode mapping yet)
  $riders = db()->query(
    "SELECT id, name, phone, vehicle, vehicle_no, is_active, status
       FROM riders r
      WHERE status = 'approved' AND is_active = 1
        AND NOT EXISTS (
          SELECT 1 FROM order_assignments a
           WHERE a.rider_id = r.id AND a.status IN ('assigned','picked_up')
        )"
  )->fetchAll();
  if (!$riders) json_ok([]);
}

$ids = array_column($riders, 'id');
$ph  = implode(',', array_fill(0, count($ids), '?'));

// Active load
$load = [];
$st = db()->prepare("SELECT rider_id, COUNT(*) AS c FROM order_assignments
                     WHERE rider_id IN ($ph) AND status IN ('assigned','picked_up')
                     GROUP BY rider_id");
$st->execute($ids);
foreach ($st->fetchAll() as $row) { $load[$row['rider_id']] = (int)$row['c']; }

// Pincode match (delivery pincode)
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
