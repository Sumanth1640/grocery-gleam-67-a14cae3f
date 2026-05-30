<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$fields = [
  'slug' => trim((string)($b['slug'] ?? '')),
  'name' => trim((string)($b['name'] ?? '')),
  'image' => trim((string)($b['image'] ?? '')),
  'tint' => trim((string)($b['tint'] ?? '#e8f5e9')),
  'sort_order' => (int)($b['sort_order'] ?? 0),
];
if ($fields['slug']==='' || $fields['name']==='') json_error('Missing required fields');
if ($id) {
  $st = db()->prepare('UPDATE categories SET slug=?,name=?,image=?,tint=?,sort_order=? WHERE id=?');
  $st->execute([...array_values($fields), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO categories (id,slug,name,image,tint,sort_order) VALUES (?,?,?,?,?,?)
                       ON DUPLICATE KEY UPDATE name=VALUES(name),image=VALUES(image),tint=VALUES(tint),sort_order=VALUES(sort_order)');
  $st->execute([$id, ...array_values($fields)]);
}
$st = db()->prepare('SELECT * FROM categories WHERE id=? OR slug=? LIMIT 1');
$st->execute([$id, $fields['slug']]);
json_ok($st->fetch());
