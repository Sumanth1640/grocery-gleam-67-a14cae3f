<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$f = [
  'name' => trim((string)($b['name'] ?? '')),
  'phone' => trim((string)($b['phone'] ?? '')),
  'vehicle' => trim((string)($b['vehicle'] ?? 'bike')),
  'vehicle_no' => trim((string)($b['vehicle_no'] ?? '')),
  'is_active' => !empty($b['is_active']) ? 1 : 0,
  'notes' => trim((string)($b['notes'] ?? '')),
];
if ($f['name']==='' || $f['phone']==='') json_error('Missing fields');
if ($id) {
  $st = db()->prepare('UPDATE riders SET name=?,phone=?,vehicle=?,vehicle_no=?,is_active=?,notes=? WHERE id=?');
  $st->execute([...array_values($f), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO riders (id,name,phone,vehicle,vehicle_no,is_active,notes) VALUES (?,?,?,?,?,?,?)');
  $st->execute([$id, ...array_values($f)]);
}
$st = db()->prepare('SELECT * FROM riders WHERE id=?'); $st->execute([$id]); $row=$st->fetch();
if ($row) $row['is_active'] = (bool)$row['is_active'];
json_ok($row);
