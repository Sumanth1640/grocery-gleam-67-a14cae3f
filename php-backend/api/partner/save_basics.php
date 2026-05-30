<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../partner_helpers.php';

require_method('POST');
$uid = current_user_id();
$b = json_body();
$name  = trim((string)($b['name'] ?? ''));
$slug  = trim((string)($b['slug'] ?? ''));
$area  = trim((string)($b['area'] ?? ''));
if ($name === '' || $slug === '' || $area === '') json_error('Missing required fields');
if (!preg_match('/^[a-z0-9-]{2,60}$/', $slug)) json_error('Invalid slug');
$cuisines = is_array($b['cuisines'] ?? null) ? array_values(array_filter($b['cuisines'], 'is_string')) : [];
if (count($cuisines) < 1) json_error('Choose at least one cuisine');

// ensure restaurant role
try {
  $r = db()->prepare('INSERT IGNORE INTO user_roles (id, user_id, role, created_at) VALUES (?, ?, ?, NOW())');
  $r->execute([uuid_v4(), $uid, 'restaurant']);
} catch (Throwable $e) {}

$payload = [
  'name'         => $name,
  'slug'         => $slug,
  'cuisines'     => json_encode($cuisines),
  'image'        => (string)($b['image'] ?? ''),
  'cover'        => (string)($b['cover'] ?? ''),
  'eta_mins'     => (int)($b['eta_mins'] ?? 30),
  'cost_for_two' => (int)($b['cost_for_two'] ?? 400),
  'veg'          => !empty($b['veg']) ? 1 : 0,
  'price_tier'   => max(1, min(3, (int)($b['price_tier'] ?? 2))),
  'offer'        => isset($b['offer']) && $b['offer'] !== '' ? (string)$b['offer'] : null,
  'area'         => $area,
  'distance_km'  => (float)($b['distance_km'] ?? 1.5),
  'opens_at'     => $b['opens_at'] ?? null,
  'closes_at'    => $b['closes_at'] ?? null,
  'is_open'      => !empty($b['is_open']) ? 1 : 0,
  'owner_name'   => trim((string)($b['owner_name'] ?? '')),
  'owner_email'  => trim((string)($b['owner_email'] ?? '')),
  'owner_phone'  => trim((string)($b['owner_phone'] ?? '')),
];

$ex = db()->prepare('SELECT id, onboarding_step FROM partner_restaurants WHERE owner_id = ? LIMIT 1');
$ex->execute([$uid]);
$existing = $ex->fetch();

if ($existing) {
  $next = max((int)($existing['onboarding_step'] ?? 1), 2);
  $set = []; $vals = [];
  foreach ($payload as $k => $v) { $set[] = "$k = ?"; $vals[] = $v; }
  $set[] = 'onboarding_step = ?'; $vals[] = $next;
  $vals[] = $existing['id']; $vals[] = $uid;
  $sql = 'UPDATE partner_restaurants SET '.implode(', ', $set).' WHERE id = ? AND owner_id = ?';
  $stmt = db()->prepare($sql);
  $stmt->execute($vals);
  json_ok(['ok' => true, 'id' => $existing['id']]);
}

$id = uuid_v4();
$cols = array_merge(['id','owner_id','status','onboarding_step'], array_keys($payload));
$ph   = implode(',', array_fill(0, count($cols), '?'));
$vals = array_merge([$id, $uid, 'pending', 2], array_values($payload));
// Required NOT NULL TEXT defaults
$stmt = db()->prepare("INSERT INTO partner_restaurants (
  id, owner_id, status, onboarding_step,
  name, slug, cuisines, image, cover, eta_mins, cost_for_two, veg, price_tier,
  offer, area, distance_km, opens_at, closes_at, is_open,
  owner_name, owner_email, owner_phone,
  fssai_doc_url, pan_doc_url, shop_license_doc_url, bank_proof_url
) VALUES (
  ?, ?, ?, ?,
  ?, ?, ?, ?, ?, ?, ?, ?, ?,
  ?, ?, ?, ?, ?, ?,
  ?, ?, ?,
  '', '', '', ''
)");
$stmt->execute([
  $id, $uid, 'pending', 2,
  $payload['name'], $payload['slug'], $payload['cuisines'], $payload['image'], $payload['cover'],
  $payload['eta_mins'], $payload['cost_for_two'], $payload['veg'], $payload['price_tier'],
  $payload['offer'], $payload['area'], $payload['distance_km'], $payload['opens_at'], $payload['closes_at'], $payload['is_open'],
  $payload['owner_name'], $payload['owner_email'], $payload['owner_phone'],
]);
json_ok(['ok' => true, 'id' => $id]);
