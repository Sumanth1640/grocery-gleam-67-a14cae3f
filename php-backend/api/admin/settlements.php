<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$days = max(1, min(365, (int)($b['days'] ?? 30)));
$st = db()->prepare("SELECT r.id, r.name, r.commission_rate,
                            COUNT(o.id) AS orders,
                            COALESCE(SUM(o.total),0) AS gross,
                            COALESCE(SUM(o.total),0) * (1 - r.commission_rate/100) AS payout
                     FROM partner_restaurants r
                     LEFT JOIN orders o ON o.restaurant_id = r.id
                       AND o.status='delivered'
                       AND o.created_at >= (NOW() - INTERVAL ? DAY)
                     WHERE r.status='approved'
                     GROUP BY r.id ORDER BY gross DESC");
$st->execute([$days]);
json_ok($st->fetchAll());
