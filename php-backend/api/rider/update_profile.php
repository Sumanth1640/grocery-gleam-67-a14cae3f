<?php
require_once __DIR__ . '/../../rider_helpers.php';
require_method('POST');
$uid = current_user_id();
$r = rider_for_user($uid);
if (!$r) json_error('Not a rider', 403);

$b = json_body();
$fields = [];
$vals   = [];

if (array_key_exists('name', $b)) {
  $name = trim((string)$b['name']);
  if (strlen($name) < 2) json_error('Name too short');
  $fields[] = 'name = ?'; $vals[] = $name;
}
if (array_key_exists('phone', $b)) {
  $phone = trim((string)$b['phone']);
  if (!preg_match('/^\d{10}$/', $phone)) json_error('Phone must be 10 digits');
  $fields[] = 'phone = ?'; $vals[] = $phone;
}
if (array_key_exists('vehicle', $b)) {
  $vehicle = trim((string)$b['vehicle']);
  if (!in_array($vehicle, ['bike','scooter','bicycle','car'], true)) json_error('Invalid vehicle');
  $fields[] = 'vehicle = ?'; $vals[] = $vehicle;
}
if (array_key_exists('vehicle_no', $b)) {
  $fields[] = 'vehicle_no = ?'; $vals[] = trim((string)$b['vehicle_no']);
}
if (array_key_exists('notes', $b)) {
  $fields[] = 'notes = ?'; $vals[] = trim((string)$b['notes']);
}
if (array_key_exists('is_active', $b)) {
  $fields[] = 'is_active = ?'; $vals[] = $b['is_active'] ? 1 : 0;
}
if (array_key_exists('preferred_outlet_ids', $b) && is_array($b['preferred_outlet_ids'])) {
  $fields[] = 'preferred_outlets = ?';
  $vals[] = json_encode(array_values(array_unique($b['preferred_outlet_ids'])));
}
if (array_key_exists('preferred_pincodes', $b) && is_array($b['preferred_pincodes'])) {
  $pins = array_values(array_filter(
    $b['preferred_pincodes'],
    fn($p) => is_string($p) && preg_match('/^\d{6}$/', $p),
  ));
  $fields[] = 'preferred_pincodes = ?';
  $vals[] = json_encode($pins);
}

if (!$fields) json_error('Nothing to update');

$vals[] = $r['id'];
db()->prepare('UPDATE riders SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($vals);

$st = db()->prepare('SELECT * FROM riders WHERE id = ?');
$st->execute([$r['id']]);
$row = $st->fetch();
$row['is_active'] = (bool)$row['is_active'];
$row['preferred_outlets']  = $row['preferred_outlets']  ? json_decode($row['preferred_outlets'],  true) : [];
$row['preferred_pincodes'] = $row['preferred_pincodes'] ? json_decode($row['preferred_pincodes'], true) : [];
json_ok(['rider' => $row]);
