<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_method('GET');
$rider = require_rider();
$st = db()->prepare(
  "SELECT a.id, a.order_id, a.status, a.notes, a.assigned_at, a.picked_up_at, a.delivered_at, a.updated_at,
          o.id AS o_id, o.total AS o_total, o.status AS o_status, o.address AS o_address,
          o.items AS o_items, o.payment AS o_payment, o.created_at AS o_created_at
     FROM order_assignments a
     LEFT JOIN orders o ON o.id = a.order_id
    WHERE a.rider_id = ?
    ORDER BY a.assigned_at DESC
    LIMIT 100"
);
$st->execute([$rider['id']]);
$rows = $st->fetchAll();
$out = [];
foreach ($rows as $r) {
  $out[] = [
    'id' => $r['id'], 'order_id' => $r['order_id'], 'status' => $r['status'],
    'notes' => $r['notes'],
    'assigned_at'  => to_iso_utc($r['assigned_at']),
    'picked_up_at' => to_iso_utc($r['picked_up_at']),
    'delivered_at' => to_iso_utc($r['delivered_at']),
    'updated_at'   => to_iso_utc($r['updated_at']),
    'orders' => [
      'id'      => $r['o_id'],
      'total'   => $r['o_total'],
      'status'  => $r['o_status'],
      'address' => $r['o_address'] ? json_decode($r['o_address'], true) : null,
      'items'   => $r['o_items']   ? json_decode($r['o_items'],   true) : null,
      'payment' => $r['o_payment'],
      'created_at' => to_iso_utc($r['o_created_at']),
    ],
  ];
}
json_ok($out);
