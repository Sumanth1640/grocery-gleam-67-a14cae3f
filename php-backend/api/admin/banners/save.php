<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$f = [
  'title' => trim((string)($b['title'] ?? '')),
  'subtitle' => trim((string)($b['subtitle'] ?? '')),
  'cta_label' => trim((string)($b['cta_label'] ?? 'Shop now')),
  'link_to' => trim((string)($b['link_to'] ?? '/')),
  'bg' => trim((string)($b['bg'] ?? '')),
  'fg' => trim((string)($b['fg'] ?? '')),
  'image' => trim((string)($b['image'] ?? '')),
  'is_active' => !empty($b['is_active']) ? 1 : 0,
  'sort_order' => (int)($b['sort_order'] ?? 0),
];
if ($f['title']==='' || $f['bg']==='' || $f['fg']==='') json_error('Missing required fields');
if ($id) {
  $st = db()->prepare('UPDATE banners SET title=?,subtitle=?,cta_label=?,link_to=?,bg=?,fg=?,image=?,is_active=?,sort_order=? WHERE id=?');
  $st->execute([...array_values($f), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO banners (id,title,subtitle,cta_label,link_to,bg,fg,image,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)');
  $st->execute([$id, ...array_values($f)]);
}
$st = db()->prepare('SELECT * FROM banners WHERE id=?');
$st->execute([$id]); $row = $st->fetch();
if ($row) $row['is_active'] = (bool)$row['is_active'];
json_ok($row);
