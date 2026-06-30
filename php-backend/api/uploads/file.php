<?php
// Public upload file viewer/proxy. Some hosts block direct static access under
// /php-backend/uploads, so images should be loaded through this endpoint.

require __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'HEAD') {
  json_error('Method not allowed', 405);
}

$path = (string)($_GET['path'] ?? '');
$path = ltrim(rawurldecode($path), '/');
$path = str_replace('\\', '/', $path);

if ($path === '' || strpos($path, '..') !== false || !preg_match('#^[A-Za-z0-9_\-/]+\.[A-Za-z0-9]+$#', $path)) {
  json_error('Invalid path', 400);
}

$parts = explode('/', $path);
$bucket = $parts[0] ?? '';
if (!in_array($bucket, ['catalog', 'partner-docs', 'refund-proofs', 'delivery-proofs'], true)) {
  json_error('Invalid bucket', 400);
}

$root = realpath(__DIR__ . '/../..') . '/uploads';
$file = realpath($root . '/' . $path);
$rootReal = realpath($root);

if (!$file || !$rootReal || !str_starts_with($file, $rootReal . DIRECTORY_SEPARATOR) || !is_file($file)) {
  json_error('File not found', 404);
}

$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$types = [
  'jpg' => 'image/jpeg',
  'jpeg' => 'image/jpeg',
  'png' => 'image/png',
  'webp' => 'image/webp',
  'gif' => 'image/gif',
  'pdf' => 'application/pdf',
];
$type = $types[$ext] ?? 'application/octet-stream';

header_remove('Content-Type');
header('Access-Control-Allow-Origin: *');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=31536000, immutable');
header('Content-Type: ' . $type);
header('Content-Length: ' . filesize($file));

if ($_SERVER['REQUEST_METHOD'] === 'HEAD') {
  exit;
}

readfile($file);
exit;