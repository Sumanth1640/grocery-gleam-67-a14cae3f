<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_method('POST');
$uid = current_user_id();
$b = json_body();

$name      = trim((string)($b['name'] ?? ''));
$phone     = trim((string)($b['phone'] ?? ''));
$vehicle   = trim((string)($b['vehicle'] ?? 'bike'));
$vehicleNo = trim((string)($b['vehicle_no'] ?? ''));
$notes     = trim((string)($b['notes'] ?? ''));
$prefOut   = is_array($b['preferred_outlet_ids'] ?? null) ? array_values(array_unique($b['preferred_outlet_ids'])) : [];
$prefPin   = is_array($b['preferred_pincodes']    ?? null) ? array_values(array_unique($b['preferred_pincodes']))    : [];

if (strlen($name) < 2)                    json_error('Name too short');
if (!preg_match('/^\d{10}$/', $phone))    json_error('Phone must be 10 digits');
if (!in_array($vehicle, ['bike','scooter','bicycle','car'], true)) $vehicle = 'bike';
$prefPin = array_values(array_filter($prefPin, fn($p) => is_string($p) && preg_match('/^\d{6}$/', $p)));

if (rider_for_user($uid)) json_error('You have already applied.', 409);

$id = uuid_v4();
db()->prepare(
  'INSERT INTO riders (id, user_id, name, phone, vehicle, vehicle_no, is_active, notes, status, preferred_outlets, preferred_pincodes)
   VALUES (?,?,?,?,?,?,?,?,?,?,?)'
)->execute([
  $id, $uid, $name, $phone, $vehicle, $vehicleNo, 0, $notes, 'pending',
  json_encode($prefOut), json_encode($prefPin),
]);

$st = db()->prepare('SELECT * FROM riders WHERE id = ?'); $st->execute([$id]);
$row = $st->fetch();
$row['is_active'] = (bool)$row['is_active'];
json_ok($row);
