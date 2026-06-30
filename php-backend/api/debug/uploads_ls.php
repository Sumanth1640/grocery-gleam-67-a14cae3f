<?php
require __DIR__ . '/../../config.php';
header('Content-Type: application/json');
$bucket = $_GET['bucket'] ?? 'delivery-proofs';
$root = realpath(__DIR__ . '/../..') . '/uploads/' . $bucket;
$out = ['root' => $root, 'realpath_root' => realpath($root), 'exists' => is_dir($root), 'entries' => []];
if (is_dir($root)) {
  $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
  foreach ($it as $f) {
    $out['entries'][] = [
      'path' => str_replace($root . '/', '', $f->getPathname()),
      'size' => $f->getSize(),
    ];
    if (count($out['entries']) > 100) break;
  }
}
echo json_encode($out, JSON_PRETTY_PRINT);
