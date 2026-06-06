<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$f = [
  'badge_text' => trim((string)($b['badge_text'] ?? '')),
  'title_line1' => trim((string)($b['title_line1'] ?? '')),
  'title_highlight' => trim((string)($b['title_highlight'] ?? '')),
  'title_line3' => trim((string)($b['title_line3'] ?? '')),
  'description' => trim((string)($b['description'] ?? '')),
  'primary_cta_label' => trim((string)($b['primary_cta_label'] ?? 'Shop now')),
  'primary_cta_link' => trim((string)($b['primary_cta_link'] ?? '/')),
  'secondary_cta_label' => trim((string)($b['secondary_cta_label'] ?? '')),
  'secondary_cta_link' => trim((string)($b['secondary_cta_link'] ?? '')),
  'image' => trim((string)($b['image'] ?? '')),
  'deal_label' => trim((string)($b['deal_label'] ?? '')),
  'deal_text' => trim((string)($b['deal_text'] ?? '')),
  'is_active' => !empty($b['is_active']) ? 1 : 0,
  'sort_order' => (int)($b['sort_order'] ?? 0),
];
if ($f['title_line1'] === '') json_error('Title line 1 is required');
if ($id) {
  $st = db()->prepare('UPDATE hero_slides SET badge_text=?,title_line1=?,title_highlight=?,title_line3=?,description=?,primary_cta_label=?,primary_cta_link=?,secondary_cta_label=?,secondary_cta_link=?,image=?,deal_label=?,deal_text=?,is_active=?,sort_order=? WHERE id=?');
  $st->execute([...array_values($f), $id]);
} else {
  $id = uuid_v4();
  $st = db()->prepare('INSERT INTO hero_slides (id,badge_text,title_line1,title_highlight,title_line3,description,primary_cta_label,primary_cta_link,secondary_cta_label,secondary_cta_link,image,deal_label,deal_text,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  $st->execute([$id, ...array_values($f)]);
}
$st = db()->prepare('SELECT * FROM hero_slides WHERE id=?');
$st->execute([$id]); $row = $st->fetch();
if ($row) { $row['is_active'] = (bool)$row['is_active']; $row['sort_order'] = (int)$row['sort_order']; }
json_ok($row);
