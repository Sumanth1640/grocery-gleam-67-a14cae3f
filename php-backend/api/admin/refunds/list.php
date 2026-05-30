<?php
require_once __DIR__ . '/../../../config.php';
require_method('POST');
require_admin();
$status = (string)(json_body()['status'] ?? '');
$sql = 'SELECT r.*, u.email AS owner_email_acct FROM refund_requests r LEFT JOIN users u ON u.id=r.user_id';
$params = [];
if ($status !== '') { $sql .= ' WHERE r.status = ?'; $params[] = $status; }
$sql .= ' ORDER BY r.created_at DESC LIMIT 300';
$st = db()->prepare($sql); $st->execute($params);
json_ok($st->fetchAll());
