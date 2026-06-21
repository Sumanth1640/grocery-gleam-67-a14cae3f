<?php
// Returns the last assign_rider trace lines (tail of secrets/assign_trace.log).
require_once __DIR__ . '/../../config.php';
$p = __DIR__ . '/../../secrets/assign_trace.log';
header('Content-Type: text/plain; charset=utf-8');
if (!is_file($p)) { echo "(no trace yet)\n"; exit; }
$lines = @file($p, FILE_IGNORE_NEW_LINES) ?: [];
echo implode("\n", array_slice($lines, -200));
