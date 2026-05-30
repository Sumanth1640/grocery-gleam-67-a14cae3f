<?php
require_once __DIR__ . '/../../../config.php';
require_method('GET');
require_admin();
$sql = "SELECT o.id, o.total, o.status, o.created_at, u.full_name, u.phone,
               a.id AS assignment_id, r.name AS rider_name
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        LEFT JOIN order_assignments a ON a.order_id = o.id
        LEFT JOIN riders r ON r.id = a.rider_id
        WHERE o.status IN ('placed','accepted','preparing','out_for_delivery')
        ORDER BY o.created_at DESC LIMIT 200";
json_ok(db()->query($sql)->fetchAll());
