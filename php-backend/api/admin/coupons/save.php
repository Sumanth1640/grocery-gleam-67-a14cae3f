<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$code = strtoupper(trim((string)($b['code'] ?? '')));
if ($code === '' || !preg_match('/^[A-Z0-9_-]{2,40}$/', $code)) json_error('Invalid code');
$type = (string)($b['discount_type'] ?? 'flat');
if (!in_array($type, ['flat','percent'], true)) json_error('Invalid type');

$payload = [
  'code'           => $code,
  'title'          => (string)($b['title'] ?? $b['description'] ?? $code),
  'description'    => (string)($b['description'] ?? ''),
  'discount_type'  => $type,
  'discount_value' => (int)($b['discount_value'] ?? 0),
  'min_order'      => (int)($b['min_order'] ?? 0),
  'max_discount'   => isset($b['max_discount'])   && $b['max_discount']   !== null ? (int)$b['max_discount']   : null,
  'usage_limit'    => isset($b['usage_limit'])    && $b['usage_limit']    !== null ? (int)$b['usage_limit']    : null,
  'per_user_limit' => isset($b['per_user_limit']) && $b['per_user_limit'] !== null ? (int)$b['per_user_limit'] : null,
  'valid_until'    => !empty($b['valid_until']) ? date('Y-m-d H:i:s', strtotime((string)$b['valid_until'])) : null,
  'is_active'      => !empty($b['is_active']) ? 1 : 0,
];

$id = (string)($b['id'] ?? '');
if ($id !== '') {
  $sql = 'UPDATE coupons SET code=?, title=?, description=?, discount_type=?, discount_value=?, min_order=?, max_discount=?, usage_limit=?, per_user_limit=?, valid_until=?, is_active=? WHERE id=?';
  db()->prepare($sql)->execute([
    $payload['code'], $payload['title'], $payload['description'], $payload['discount_type'],
    $payload['discount_value'], $payload['min_order'], $payload['max_discount'],
    $payload['usage_limit'], $payload['per_user_limit'], $payload['valid_until'],
    $payload['is_active'], $id,
  ]);
} else {
  $id = uuid_v4();
  $sql = 'INSERT INTO coupons (id, code, title, description, discount_type, discount_value, min_order, max_discount, usage_limit, per_user_limit, valid_until, is_active)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
          ON DUPLICATE KEY UPDATE
            title=VALUES(title), description=VALUES(description),
            discount_type=VALUES(discount_type), discount_value=VALUES(discount_value),
            min_order=VALUES(min_order), max_discount=VALUES(max_discount),
            usage_limit=VALUES(usage_limit), per_user_limit=VALUES(per_user_limit),
            valid_until=VALUES(valid_until), is_active=VALUES(is_active)';
  db()->prepare($sql)->execute([
    $id, $payload['code'], $payload['title'], $payload['description'], $payload['discount_type'],
    $payload['discount_value'], $payload['min_order'], $payload['max_discount'],
    $payload['usage_limit'], $payload['per_user_limit'], $payload['valid_until'],
    $payload['is_active'],
  ]);
}
$st = db()->prepare('SELECT * FROM coupons WHERE id=? OR code=? LIMIT 1');
$st->execute([$id, $payload['code']]);
$row = $st->fetch();
if ($row) {
  $row['is_active'] = (bool)$row['is_active'];
}
json_ok($row);
