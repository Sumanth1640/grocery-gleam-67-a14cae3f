<?php
require_once __DIR__ . '/../../config.php';
require_method('POST');
require_admin();
$b = json_body();
$days = max(1, min(365, (int)($b['days'] ?? 30)));
$st = db()->prepare("SELECT DATE(created_at) AS d, COUNT(*) AS orders, COALESCE(SUM(total),0) AS revenue
                     FROM orders
                     WHERE created_at >= (NOW() - INTERVAL ? DAY)
                     GROUP BY DATE(created_at) ORDER BY d ASC");
$st->execute([$days]);
$daily = $st->fetchAll();
$totals = db()->query("SELECT
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COALESCE(SUM(total),0) FROM orders WHERE status='delivered') AS total_revenue,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM partner_restaurants WHERE status='approved') AS total_restaurants
  ")->fetch();
$top = db()->query("SELECT JSON_UNQUOTE(JSON_EXTRACT(items, '$[0].product.name')) AS name, COUNT(*) AS c
                    FROM orders WHERE status='delivered' AND items IS NOT NULL
                    GROUP BY name ORDER BY c DESC LIMIT 10")->fetchAll();
json_ok(['daily'=>$daily,'totals'=>$totals,'top_items'=>$top]);
