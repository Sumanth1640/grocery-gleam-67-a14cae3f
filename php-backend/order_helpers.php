<?php
// Shared grocery order helpers used by COD and paid checkout flows.
require_once __DIR__ . '/partner_helpers.php';

function order_address_pincode(array $address): string {
  $raw = trim((string)($address['pincode'] ?? ''));
  $pin = preg_replace('/\D+/', '', $raw);
  if ($pin && preg_match('/^\d{4,8}$/', $pin)) return $pin;

  $haystack = implode(' ', array_map('strval', [
    $address['line1'] ?? '',
    $address['line2'] ?? '',
    $address['city'] ?? '',
  ]));
  if (preg_match('/\b(\d{4,8})\b/', $haystack, $m)) return $m[1];
  return '';
}

function resolve_warehouse_id_for_address(array $address): ?string {
  $pin = order_address_pincode($address);
  if ($pin === '') return null;

  try {
    $st = db()->prepare(
      'SELECT w.id FROM warehouses w
       JOIN warehouse_pincodes wp ON wp.warehouse_id = w.id
       WHERE w.is_active = 1 AND REPLACE(TRIM(wp.pincode), " ", "") = ?
       ORDER BY wp.priority DESC, w.sort_order ASC
       LIMIT 1'
    );
    $st->execute([$pin]);
    $id = $st->fetchColumn();
    if ($id) return (string)$id;

    $st = db()->prepare(
      'SELECT id FROM warehouses
       WHERE is_active = 1 AND REPLACE(TRIM(pincode), " ", "") = ?
       ORDER BY sort_order ASC
       LIMIT 1'
    );
    $st->execute([$pin]);
    $id = $st->fetchColumn();
    return $id ? (string)$id : null;
  } catch (Throwable $e) {
    return null;
  }
}

function notify_warehouse_managers_for_order(?string $warehouse_id, int $total, string $order_id): void {
  if (!$warehouse_id) return;

  try {
    $wname = null;
    $st = db()->prepare('SELECT name FROM warehouses WHERE id=?');
    $st->execute([$warehouse_id]);
    $wname = $st->fetchColumn() ?: null;

    $st = db()->prepare('SELECT user_id FROM warehouse_managers WHERE warehouse_id=?');
    $st->execute([$warehouse_id]);
    foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $mgrId) {
      notify_user($mgrId, 'order', 'New product order',
        'A customer placed an order of ₹'.$total.($wname ? ' at '.$wname : '').'.',
        '/admin/orders');
    }
  } catch (Throwable $e) { /* ignore notification failures */ }
}

function notify_partner_for_order(?string $restaurant_id, int $total, string $order_id): void {
  if (!$restaurant_id) return;
  try {
    $st = db()->prepare('SELECT owner_id, name FROM partner_restaurants WHERE id=?');
    $st->execute([$restaurant_id]);
    $row = $st->fetch();
    if (!$row) return;
    $owner = $row['owner_id'] ?? null;
    if ($owner) {
      notify_user($owner, 'order', 'New food order',
        'A customer placed an order of ₹'.$total.' at '.($row['name'] ?? 'your restaurant').'.',
        '/partner/orders');
    }
    // Also notify outlet managers for this restaurant.
    try {
      $m = db()->prepare('SELECT DISTINCT user_id FROM partner_outlet_managers WHERE restaurant_id=?');
      $m->execute([$restaurant_id]);
      foreach ($m->fetchAll(PDO::FETCH_COLUMN) as $mgrId) {
        notify_user($mgrId, 'order', 'New order received',
          'A customer placed an order of ₹'.$total.'.', '/outlet/orders');
      }
    } catch (Throwable $e) { /* ignore */ }
  } catch (Throwable $e) { /* ignore */ }
}

function order_column_exists(string $column): bool {
  try {
    $st = db()->prepare('SHOW COLUMNS FROM orders LIKE ?');
    $st->execute([$column]);
    return (bool)$st->fetch();
  } catch (Throwable $e) { return false; }
}

function ensure_order_routing_columns(): void {
  static $done = false;
  if ($done) return;
  $defs = [
    'restaurant_id' => 'ALTER TABLE orders ADD COLUMN restaurant_id CHAR(36) DEFAULT NULL AFTER user_id',
    'warehouse_id' => 'ALTER TABLE orders ADD COLUMN warehouse_id CHAR(36) DEFAULT NULL AFTER restaurant_id',
    'outlet_id' => 'ALTER TABLE orders ADD COLUMN outlet_id CHAR(36) DEFAULT NULL AFTER warehouse_id',
    'payment_status' => "ALTER TABLE orders ADD COLUMN payment_status ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending' AFTER status",
  ];
  foreach ($defs as $col => $sql) {
    if (!order_column_exists($col)) {
      try { db()->exec($sql); } catch (Throwable $e) { /* existing installs may lack ALTER privileges */ }
    }
  }
  $done = true;
}

function insert_order_row(string $id, string $uid, ?string $warehouseId, ?string $restaurantId, ?string $outletId, array $items, array $address, string $payment, int $subtotal, int $delivery, int $total, ?string $paymentStatus = null): void {
  ensure_order_routing_columns();
  // Try the most-complete column set, then fall back progressively.
  $attempts = [];
  if ($paymentStatus !== null) {
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, warehouse_id, restaurant_id, outlet_id, items, address, payment, subtotal, delivery, total, payment_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid,$warehouseId,$restaurantId,$outletId, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total,$paymentStatus]];
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, warehouse_id, restaurant_id, items, address, payment, subtotal, delivery, total, payment_status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid,$warehouseId,$restaurantId, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total,$paymentStatus]];
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, restaurant_id, items, address, payment, subtotal, delivery, total, payment_status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid,$restaurantId, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total,$paymentStatus]];
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, items, address, payment, subtotal, delivery, total, payment_status) VALUES (?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total,$paymentStatus]];
  } else {
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, warehouse_id, restaurant_id, outlet_id, items, address, payment, subtotal, delivery, total) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid,$warehouseId,$restaurantId,$outletId, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total]];
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, warehouse_id, restaurant_id, items, address, payment, subtotal, delivery, total) VALUES (?,?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid,$warehouseId,$restaurantId, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total]];
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, restaurant_id, items, address, payment, subtotal, delivery, total) VALUES (?,?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid,$restaurantId, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total]];
    $attempts[] = ['sql' => 'INSERT INTO orders (id, user_id, items, address, payment, subtotal, delivery, total) VALUES (?,?,?,?,?,?,?,?)',
      'p' => [$id,$uid, json_encode($items, JSON_UNESCAPED_UNICODE), json_encode($address, JSON_UNESCAPED_UNICODE), $payment,$subtotal,$delivery,$total]];
  }
  if ($restaurantId !== null) {
    $attempts = array_values(array_filter($attempts, fn($a) => strpos($a['sql'], 'restaurant_id') !== false));
  }
  if ($outletId !== null) {
    $attempts = array_values(array_filter($attempts, fn($a) => strpos($a['sql'], 'outlet_id') !== false));
  }
  if (!$attempts) {
    throw new RuntimeException('orders table is missing restaurant/outlet routing columns');
  }
  $lastErr = null;
  foreach ($attempts as $a) {
    try { db()->prepare($a['sql'])->execute($a['p']); return; }
    catch (Throwable $e) { $lastErr = $e; }
  }
  if ($lastErr) throw $lastErr;
}
