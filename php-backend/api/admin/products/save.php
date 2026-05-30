<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$id = $b['id'] ?? null;
$fields = [
  'slug' => trim((string)($b['slug'] ?? '')),
  'name' => trim((string)($b['name'] ?? '')),
  'category_slug' => trim((string)($b['category_slug'] ?? '')),
  'image' => trim((string)($b['image'] ?? '')),
  'weight' => trim((string)($b['weight'] ?? '')),
  'price' => (int)($b['price'] ?? 0),
  'mrp' => (int)($b['mrp'] ?? 0),
  'eta' => trim((string)($b['eta'] ?? '11 mins')),
  'rating' => (float)($b['rating'] ?? 4.5),
  'in_stock' => !empty($b['in_stock']) ? 1 : 0,
];
if ($fields['slug']==='' || $fields['name']==='' || $fields['category_slug']==='') json_error('Missing required fields');

if ($id) {
  $sql = 'UPDATE products SET slug=?,name=?,category_slug=?,image=?,weight=?,price=?,mrp=?,eta=?,rating=?,in_stock=? WHERE id=?';
  $st = db()->prepare($sql);
  $st->execute([...array_values($fields), $id]);
} else {
  $id = uuid_v4();
  $sql = 'INSERT INTO products (id,slug,name,category_slug,image,weight,price,mrp,eta,rating,in_stock) VALUES (?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE name=VALUES(name),category_slug=VALUES(category_slug),image=VALUES(image),weight=VALUES(weight),price=VALUES(price),mrp=VALUES(mrp),eta=VALUES(eta),rating=VALUES(rating),in_stock=VALUES(in_stock)';
  $st = db()->prepare($sql);
  $st->execute([$id, ...array_values($fields)]);
}
$st = db()->prepare('SELECT * FROM products WHERE id=? OR slug=? LIMIT 1');
$st->execute([$id, $fields['slug']]);
$row = $st->fetch();
if ($row) $row['in_stock'] = (bool)$row['in_stock'];
json_ok($row);
