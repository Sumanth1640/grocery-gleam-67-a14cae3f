<?php
// ============================================================
// uploads/upload.php — multipart file upload
//
// POST multipart/form-data:
//   bucket: "catalog" | "partner-docs"
//   folder: subfolder within bucket (e.g. "products", "categories",
//           "dishes", "restaurants", "banners", or "<userId>" for partner docs)
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

if (!in_array($bucket, ['catalog', 'partner-docs', 'refund-proofs', 'delivery-proofs'], true)) {
  json_error('Invalid bucket', 400);
}

// Authorization:
// - catalog/products|categories|banners are admin-only
// - catalog/dishes|restaurants are open to any authenticated user
//   (partners upload their own dish/restaurant images here)
// - partner-docs uploads must be scoped to the caller's own user id folder
// - refund-proofs uploads must be scoped to the caller's own user id folder
// - delivery-proofs uploads must be scoped to the caller's own user id folder (rider)
if ($bucket === 'catalog') {
  $partnerFolders = ['dishes', 'restaurants'];
  if (!in_array($folder, $partnerFolders, true)) {
    require_admin($uid);
  }
  // any authenticated user may upload to dishes/restaurants
} else if ($bucket === 'partner-docs' || $bucket === 'refund-proofs' || $bucket === 'delivery-proofs') {
  if ($folder === '' || $folder !== $uid) {
    json_error('Forbidden: files must be uploaded to your own folder', 403);
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
  'catalog'         => ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  'partner-docs'    => ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  'refund-proofs'   => ['jpg', 'jpeg', 'png', 'webp'],
  'delivery-proofs' => ['jpg', 'jpeg', 'png', 'webp'],
];

if (!in_array($ext, $allowedByBucket[$bucket], true)) {
  json_error('File type not allowed for this bucket', 400);
}

if (!preg_match('#^[A-Za-z0-9_\-/]+$#', $folder)) {
  json_error('Invalid folder', 400);
}

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

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$script = $_SERVER['SCRIPT_NAME'] ?? '';
$backendBase = preg_replace('#/api/uploads/upload\.php$#', '', $script);
$staticUrl = $scheme . '://' . $host . $backendBase . '/uploads/' . $relPath;
$url = $scheme . '://' . $host . $backendBase . '/api/uploads/file.php?path=' . rawurlencode($relPath);

json_ok(['path' => $relPath, 'url' => $url, 'static_url' => $staticUrl]);
