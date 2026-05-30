<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$code = trim((string)($b['code'] ?? ''));
$name = trim((string)($b['name'] ?? ''));
if ($code === '' || !preg_match('/^[a-zA-Z0-9_-]+$/', $code)) json_error('Invalid code');
if ($name === '') json_error('Missing name');

$row = [
  'name'       => $name,
  'code'       => $code,
  'address'    => (string)($b['address'] ?? ''),
  'city'       => (string)($b['city'] ?? ''),
  'pincode'    => (string)($b['pincode'] ?? ''),
  'lat'        => isset($b['lat']) && $b['lat'] !== null ? (float)$b['lat'] : null,
  'lng'        => isset($b['lng']) && $b['lng'] !== null ? (float)$b['lng'] : null,
  'is_active'  => !empty($b['is_active']) ? 1 : 0,
  'sort_order' => (int)($b['sort_order'] ?? 0),
];

$id = (string)($b['id'] ?? '');
if ($id !== '') {
  $sql = 'UPDATE warehouses SET name=?, code=?, address=?, city=?, pincode=?, lat=?, lng=?, is_active=?, sort_order=? WHERE id=?';
  db()->prepare($sql)->execute([
    $row['name'],$row['code'],$row['address'],$row['city'],$row['pincode'],
    $row['lat'],$row['lng'],$row['is_active'],$row['sort_order'],$id,
  ]);
} else {
  $id = uuid_v4();
  $sql = 'INSERT INTO warehouses (id,name,code,address,city,pincode,lat,lng,is_active,sort_order)
          VALUES (?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            name=VALUES(name), address=VALUES(address), city=VALUES(city),
            pincode=VALUES(pincode), lat=VALUES(lat), lng=VALUES(lng),
            is_active=VALUES(is_active), sort_order=VALUES(sort_order)';
  db()->prepare($sql)->execute([
    $id,$row['name'],$row['code'],$row['address'],$row['city'],$row['pincode'],
    $row['lat'],$row['lng'],$row['is_active'],$row['sort_order'],
  ]);
}
$st = db()->prepare('SELECT * FROM warehouses WHERE id=? OR code=? LIMIT 1');
$st->execute([$id, $code]);
$out = $st->fetch();
if ($out) { $out['is_active'] = (bool)$out['is_active']; $out['sort_order'] = (int)$out['sort_order']; }
json_ok($out);
