<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$f = [
  'title'      => trim((string)($b['title'] ?? '')),
  'subtitle'   => trim((string)($b['subtitle'] ?? '')),
  'cta_label'  => trim((string)($b['cta_label'] ?? 'Shop')),
  'link_to'    => trim((string)($b['link_to'] ?? '/')),
  'tint'       => trim((string)($b['tint'] ?? 'oklch(0.93 0.1 95)')),
  'is_active'  => !empty($b['is_active']) ? 1 : 0,
  'sort_order' => (int)($b['sort_order'] ?? 0),
];
if ($f['title'] === '') json_error('Title is required');
if ($id) {
  $st = db()->prepare('UPDATE offer_tiles SET title=?,subtitle=?,cta_label=?,link_to=?,tint=?,is_active=?,sort_order=? WHERE id=?');
  $st->execute([...array_values($f), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO offer_tiles (id,title,subtitle,cta_label,link_to,tint,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?)');
  $st->execute([$id, ...array_values($f)]);
}
$st = db()->prepare('SELECT * FROM offer_tiles WHERE id=?');
$st->execute([$id]); $row = $st->fetch();
if ($row) { $row['is_active'] = (bool)$row['is_active']; $row['sort_order'] = (int)$row['sort_order']; }
json_ok($row);
