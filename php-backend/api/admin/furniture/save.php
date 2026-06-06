<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$slug = trim((string)($b['slug'] ?? ''));
$name = trim((string)($b['name'] ?? ''));
if ($slug === '' || $name === '') json_error('Slug and name are required');
$f = [
  'slug'       => $slug,
  'name'       => $name,
  'category'   => trim((string)($b['category'] ?? 'living')),
  'wood'       => trim((string)($b['wood'] ?? 'Sheesham')),
  'price'      => (float)($b['price'] ?? 0),
  'mrp'        => (float)($b['mrp'] ?? 0),
  'image'      => trim((string)($b['image'] ?? '')),
  'blurb'      => trim((string)($b['blurb'] ?? '')),
  'dimensions' => trim((string)($b['dimensions'] ?? '')),
  'is_active'  => !empty($b['is_active']) ? 1 : 0,
  'sort_order' => (int)($b['sort_order'] ?? 0),
];
if ($id) {
  $st = db()->prepare('UPDATE furniture_items SET slug=?,name=?,category=?,wood=?,price=?,mrp=?,image=?,blurb=?,dimensions=?,is_active=?,sort_order=? WHERE id=?');
  $st->execute([...array_values($f), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO furniture_items (id,slug,name,category,wood,price,mrp,image,blurb,dimensions,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  $st->execute([$id, ...array_values($f)]);
}
$st = db()->prepare('SELECT * FROM furniture_items WHERE id=?');
$st->execute([$id]); $row = $st->fetch();
if ($row) {
  $row['price'] = (float)$row['price'];
  $row['mrp'] = (float)$row['mrp'];
  $row['is_active'] = (bool)$row['is_active'];
  $row['sort_order'] = (int)$row['sort_order'];
}
json_ok($row);
