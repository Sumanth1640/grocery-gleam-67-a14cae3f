<?php
// ============================================================
// uploads/upload.php — multipart file upload
//
// Stores files under php-backend/uploads/<bucket>/<path> and returns
// the public URL the React app should display / persist.
//
// POST multipart/form-data:
//   bucket: "catalog" | "partner-docs"
//   folder: subfolder within bucket (e.g. "products", "categories",
//           or "<userId>" for partner docs)
//   kind:   optional filename prefix (e.g. "fssai", "pan")
//   file:   the file blob
//
// Response: { path: "<bucket>/<folder>/<file>", url: "<absolute url>" }
// ============================================================

require __DIR__ . '/../../config.php';
require_method('POST');

$uid = current_user_id();

$bucket = $_POST['bucket'] ?? '';
$folder = $_POST['folder'] ?? '';
$kind   = $_POST['kind']   ?? '';

if (!in_array($bucket, ['catalog', 'partner-docs'], true)) {
  json_error('Invalid bucket', 400);
}

// Authorization:
// - catalog uploads (product/category/banner images) are admin-only
// - partner-docs uploads must be scoped to the caller's own user id folder
if ($bucket === 'catalog') {
  require_admin($uid);
} else { // partner-docs
  if ($folder === '' || $folder !== $uid) {
    json_error('Forbidden: docs must be uploaded to your own folder', 403);
  }
}

if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
  json_error('No file provided', 400);
}

$f = $_FILES['file'];
if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
  json_error('Upload failed (error code ' . ($f['error'] ?? -1) . ')', 400);
}

$size = (int)($f['size'] ?? 0);
if ($size <= 0 || $size > 5 * 1024 * 1024) {
  json_error('File must be 1B – 5MB', 400);
}

$origName = (string)($f['name'] ?? 'file');
$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION)) ?: 'bin';

$allowedByBucket = [
  'catalog'      => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  'partner-docs' => ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
];
if (!in_array($ext, $allowedByBucket[$bucket], true)) {
  json_error('File type not allowed for this bucket', 400);
}

// Sanitize folder (no traversal, restricted charset)
if (!preg_match('#^[A-Za-z0-9_\-/]+$#', $folder)) {
  json_error('Invalid folder', 400);
}

// Filename: "<kind>-<timestamp>-<rand>.<ext>" or "<uuid>.<ext>"
$kindSafe = preg_replace('/[^A-Za-z0-9_\-]/', '', $kind);
$base = $kindSafe !== ''
  ? sprintf('%s-%d-%s.%s', $kindSafe, time(), bin2hex(random_bytes(4)), $ext)
  : sprintf('%s.%s', uuid_v4(), $ext);

$rootDir = realpath(__DIR__ . '/../..') . '/uploads';
$targetDir = $rootDir . '/' . $bucket . '/' . $folder;
if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
  json_error('Could not create upload directory', 500);
}

$targetPath = $targetDir . '/' . $base;
if (!move_uploaded_file($f['tmp_name'], $targetPath)) {
  json_error('Could not save uploaded file', 500);
}
@chmod($targetPath, 0644);

$relPath = $bucket . '/' . $folder . '/' . $base;

// Build absolute URL pointing at /uploads/<relPath>
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
// SCRIPT_NAME is .../api/uploads/upload.php — strip "/api/uploads/upload.php"
// to find the php-backend root URL, then append "/uploads/<relPath>".
$script = $_SERVER['SCRIPT_NAME'] ?? '';
$backendBase = preg_replace('#/api/uploads/upload\.php$#', '', $script);
$url = $scheme . '://' . $host . $backendBase . '/uploads/' . $relPath;

json_ok(['path' => $relPath, 'url' => $url]);
