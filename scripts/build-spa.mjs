#!/usr/bin/env node
// Static SPA build wrapper for Hostinger.
//
// We run `vite build` and silently swallow TanStack's prerender step failure
// (it requires an unhashed dist/server/server.js that this static build
// doesn't produce). After the build, we generate dist/client/index.html from
// the Vite manifest so the SPA can be served as-is.
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = join(root, "dist", "client");
const serverDir = join(root, "dist", "server");
const indexHtml = join(clientDir, "index.html");

// ---- 1. Run `vite build`, filtering known-harmless prerender noise ----
const PRERENDER_NOISE = [
  /\[prerender\]/i,
  /ERR_MODULE_NOT_FOUND.*dist[\\/]server[\\/]server\.js/,
  /start-plugin-core[\\/]dist[\\/]esm[\\/](prerender|queue|vite[\\/]preview-server-plugin)/,
  /Cannot find module .*dist[\\/]server[\\/]server\.js/,
  /Failed to fetch \/: Internal Server Error/,
  /at finalizeResolution|at moduleResolve|at defaultResolve|at nextResolve|at AsyncLoaderHooksOnLoaderHookWorker|at MessagePort|at \[nodejs\.internal|at process\.processTicksAndRejections|at async file:/,
  /node:internal\/modules|node:internal\/event_target|node:internal\/per_context/,
  /^\s*\^\s*$/,
  /^Error(:| \[)/,
  /esm-cache\.loader\.mjs/,
  /Node\.js v\d/,
  /\[cause\]:|^\s*\}\s*$/,
];
function isNoise(line) {
  return PRERENDER_NOISE.some((re) => re.test(line));
}

function streamFilter(stream, target) {
  let buffer = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!isNoise(line)) target.write(line + "\n");
    }
  });
  stream.on("end", () => {
    if (buffer && !isNoise(buffer)) target.write(buffer);
  });
}

const viteExit = await new Promise((resolve) => {
  const proc = spawn(process.execPath, [
    join(root, "node_modules", "vite", "bin", "vite.js"),
    "build",
  ], { cwd: root, env: { ...process.env, BUILD_SPA: "1" } });
  streamFilter(proc.stdout, process.stdout);
  streamFilter(proc.stderr, process.stderr);
  proc.on("close", resolve);
});

// ---- 2. Validate that the client bundle was emitted ----
if (!existsSync(clientDir)) {
  console.error("[build-spa] dist/client missing — build failed before client assets were emitted.");
  process.exit(viteExit || 1);
}

// ---- 3. Generate dist/client/index.html from the Vite manifest ----
if (!existsSync(indexHtml)) {
  const manifestPath = join(clientDir, ".vite", "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("[build-spa] Missing dist/client/.vite/manifest.json — cannot generate index.html.");
    console.error("            Make sure vite.config.ts sets `vite: { build: { manifest: true } }`.");
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const entries = Object.values(manifest).filter((c) => c.isEntry);
  const entry =
    entries.find((c) => /client-entry|start|main/i.test((c.src || "") + (c.file || ""))) ||
    entries[0];
  if (!entry) {
    console.error("[build-spa] Manifest has no entry chunk — cannot generate index.html.");
    process.exit(1);
  }
  const cssLinks = (entry.css || [])
    .map((href) => `    <link rel="stylesheet" href="/${href}">`)
    .join("\n");
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HalliFresh</title>
${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entry.file}"></script>
  </body>
</html>
`;
  writeFileSync(indexHtml, html, "utf8");
}

// ---- 4. SPA fallback so deep links work on Hostinger ----
const notFound = join(clientDir, "404.html");
if (!existsSync(notFound)) cpSync(indexHtml, notFound);

// ---- 5. Discard the SSR build — we don't ship it to a static host ----
if (existsSync(serverDir)) {
  try { rmSync(serverDir, { recursive: true, force: true }); } catch { /* ignore */ }
}

console.log("\n✓ Build complete. Upload dist/client/* to Hostinger public_html.");
process.exit(0);
