<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$rid = (string)($b['restaurant_id'] ?? '');
if (!$rid) json_error('restaurant_id required');
ensure_owns_restaurant($uid, $rid);
$id = (string)($b['id'] ?? '');
$cols = [
  'restaurant_id' => $rid,
  'name'          => (string)($b['name'] ?? ''),
  'address'       => (string)($b['address'] ?? ''),
  'area'          => (string)($b['area'] ?? ''),
  'pincode'       => (string)($b['pincode'] ?? ''),
  'lat'           => isset($b['lat']) && $b['lat'] !== null ? (float)$b['lat'] : null,
  'lng'           => isset($b['lng']) && $b['lng'] !== null ? (float)$b['lng'] : null,
  'eta_mins'      => (int)($b['eta_mins'] ?? 30),
  'is_open'       => !empty($b['is_open']) ? 1 : 0,
  'is_active'     => !empty($b['is_active']) ? 1 : 0,
  'sort_order'    => (int)($b['sort_order'] ?? 0),
];
if ($id) {
  $set = []; $vals = [];
  foreach ($cols as $k => $v) { $set[] = "$k = ?"; $vals[] = $v; }
  $vals[] = $id;
  $stmt = db()->prepare('UPDATE partner_outlets SET '.implode(', ', $set).' WHERE id = ?');
  $stmt->execute($vals);
  $sel = db()->prepare('SELECT * FROM partner_outlets WHERE id = ?');
  $sel->execute([$id]);
  json_ok($sel->fetch());
}
$id = uuid_v4();
$cols2 = array_merge(['id' => $id], $cols);
$names = implode(',', array_keys($cols2));
$ph    = implode(',', array_fill(0, count($cols2), '?'));
$stmt = db()->prepare("INSERT INTO partner_outlets ($names) VALUES ($ph)");
$stmt->execute(array_values($cols2));
$sel = db()->prepare('SELECT * FROM partner_outlets WHERE id = ?');
$sel->execute([$id]);
json_ok($sel->fetch());
