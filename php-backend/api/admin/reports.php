<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$days = max(1, min(365, (int)($b['days'] ?? 30)));
$status_breakdown = db()->prepare("SELECT status, COUNT(*) AS c FROM orders
                                   WHERE created_at >= (NOW() - INTERVAL ? DAY) GROUP BY status");
$status_breakdown->execute([$days]);
$payment_breakdown = db()->prepare("SELECT payment, COUNT(*) AS c, COALESCE(SUM(total),0) AS amount FROM orders
                                    WHERE created_at >= (NOW() - INTERVAL ? DAY) GROUP BY payment");
$payment_breakdown->execute([$days]);
$top_customers = db()->prepare("SELECT u.id, u.full_name, u.email, COUNT(o.id) AS orders, SUM(o.total) AS spent
                                FROM orders o JOIN users u ON u.id=o.user_id
                                WHERE o.status='delivered' AND o.created_at >= (NOW() - INTERVAL ? DAY)
                                GROUP BY u.id ORDER BY spent DESC LIMIT 10");
$top_customers->execute([$days]);
json_ok([
  'status' => $status_breakdown->fetchAll(),
  'payment' => $payment_breakdown->fetchAll(),
  'top_customers' => $top_customers->fetchAll(),
]);
