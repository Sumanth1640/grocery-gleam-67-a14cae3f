<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$title = trim((string)($b['title'] ?? ''));
$image = trim((string)($b['image'] ?? ''));
if ($title === '' || $image === '') json_error('Title and image are required');
$f = [
  'eyebrow'     => trim((string)($b['eyebrow'] ?? '')),
  'title'       => $title,
  'highlight'   => trim((string)($b['highlight'] ?? '')),
  'blurb'       => trim((string)($b['blurb'] ?? '')),
  'cta_label'   => trim((string)($b['cta_label'] ?? 'Explore the collection')),
  'cta_link'    => trim((string)($b['cta_link'] ?? '/furniture')),
  'image'       => $image,
  'bg_gradient' => trim((string)($b['bg_gradient'] ?? '')),
  'is_active'   => !empty($b['is_active']) ? 1 : 0,
  'sort_order'  => (int)($b['sort_order'] ?? 0),
];
if ($id) {
  $st = db()->prepare('UPDATE furniture_promos SET eyebrow=?,title=?,highlight=?,blurb=?,cta_label=?,cta_link=?,image=?,bg_gradient=?,is_active=?,sort_order=? WHERE id=?');
  $st->execute([...array_values($f), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO furniture_promos (id,eyebrow,title,highlight,blurb,cta_label,cta_link,image,bg_gradient,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  $st->execute([$id, ...array_values($f)]);
}
$st = db()->prepare('SELECT * FROM furniture_promos WHERE id=?');
$st->execute([$id]); $row = $st->fetch();
if ($row) {
  $row['is_active']  = (bool)$row['is_active'];
  $row['sort_order'] = (int)$row['sort_order'];
}
json_ok($row);
