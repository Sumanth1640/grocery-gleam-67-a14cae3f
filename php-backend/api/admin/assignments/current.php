<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin_or_warehouse_manager();
$b = json_body();
$order_id = (string)($b['order_id'] ?? '');
if ($order_id === '') json_error('Missing order_id');

$st = db()->prepare(
  "SELECT a.id, a.status, a.rider_id, a.assigned_at, a.picked_up_at, a.delivered_at, a.proof_photo,
          r.name AS r_name, r.phone AS r_phone, r.vehicle AS r_vehicle, r.vehicle_no AS r_vehicle_no
     FROM order_assignments a
     LEFT JOIN riders r ON r.id = a.rider_id
    WHERE a.order_id = ? LIMIT 1"
);
$st->execute([$order_id]);
$a = $st->fetch();
if (!$a) { json_ok(null); }
json_ok([
  'id' => $a['id'], 'status' => $a['status'], 'rider_id' => $a['rider_id'],
  'assigned_at'  => to_iso_utc($a['assigned_at']),
  'picked_up_at' => to_iso_utc($a['picked_up_at']),
  'delivered_at' => to_iso_utc($a['delivered_at']),
  'proof_photo'  => $a['proof_photo'] ?? null,
  'riders' => $a['r_name'] ? [
    'name' => $a['r_name'], 'phone' => $a['r_phone'],
    'vehicle' => $a['r_vehicle'], 'vehicle_no' => $a['r_vehicle_no'],
  ] : null,
]);
