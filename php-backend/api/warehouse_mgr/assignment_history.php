<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();
$wanted = (string)($b['warehouse_id'] ?? '');
$limit  = max(1, min(500, (int)($b['limit'] ?? 200)));

$m = db()->prepare('SELECT warehouse_id FROM warehouse_managers WHERE user_id = ?');
$m->execute([$uid]);
$ids = array_column($m->fetchAll(), 'warehouse_id');
if ($wanted) {
  if (!in_array($wanted, $ids, true)) json_error('Not your warehouse', 403);
  $ids = [$wanted];
}
if (!$ids) json_ok([]);

$in = implode(',', array_fill(0, count($ids), '?'));
$sql = "
  SELECT a.id, a.order_id, a.rider_id, a.status,
         a.assigned_at, a.picked_up_at, a.delivered_at, a.proof_photo,
         o.warehouse_id, o.status AS order_status, o.total, o.payment, o.created_at AS order_created_at,
         o.address,
         w.name AS warehouse_name, w.code AS warehouse_code,
         r.name AS rider_name, r.phone AS rider_phone,
         r.vehicle AS rider_vehicle, r.vehicle_no AS rider_vehicle_no
    FROM order_assignments a
    JOIN orders o ON o.id = a.order_id
    LEFT JOIN warehouses w ON w.id = o.warehouse_id
    LEFT JOIN riders r ON r.id = a.rider_id
   WHERE o.warehouse_id IN ($in)
   ORDER BY COALESCE(a.assigned_at, o.created_at) DESC
   LIMIT $limit
";
$st = db()->prepare($sql);
$st->execute($ids);
$rows = $st->fetchAll();

$out = [];
foreach ($rows as $r) {
  $addr = $r['address'];
  if (is_string($addr)) { $addr = json_decode($addr, true) ?: null; }
  $out[] = [
    'id'           => $r['id'],
    'order_id'     => $r['order_id'],
    'rider_id'     => $r['rider_id'],
    'status'       => $r['status'],
    'assigned_at'  => to_iso_utc($r['assigned_at']),
    'picked_up_at' => to_iso_utc($r['picked_up_at']),
    'delivered_at' => to_iso_utc($r['delivered_at']),
    'proof_photo'  => $r['proof_photo'] ?? null,
    'order' => [
      'id'         => $r['order_id'],
      'status'     => $r['order_status'],
      'total'      => (float)$r['total'],
      'payment'    => $r['payment'],
      'created_at' => to_iso_utc($r['order_created_at']),
      'address'    => $addr,
    ],
    'warehouse' => [
      'id'   => $r['warehouse_id'],
      'name' => $r['warehouse_name'],
      'code' => $r['warehouse_code'],
    ],
    'rider' => $r['rider_name'] ? [
      'name'       => $r['rider_name'],
      'phone'      => $r['rider_phone'],
      'vehicle'    => $r['rider_vehicle'],
      'vehicle_no' => $r['rider_vehicle_no'],
    ] : null,
  ];
}
json_ok($out);
