#!/usr/bin/env node
// Build wrapper for static SPA hosting (Hostinger).
// - Runs `vite build`.
// - Ignores TanStack's prerender step failure (it needs an unhashed
//   dist/server/server.js that the Cloudflare plugin in the shared config
//   doesn't emit). We don't need prerendered HTML for a client-only SPA.
// - After the build, ensures dist/client/index.html exists by generating it
//   from dist/client/.vite/manifest.json.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const clientDir = join(root, "dist", "client");
const indexHtml = join(clientDir, "index.html");

// 1. Run vite build. Allow non-zero exit (prerender failure) — we recover below.
const res = spawnSync("npx", ["vite", "build"], { stdio: "inherit", shell: true, cwd: root });
if (res.status !== 0) {
  console.warn(`\n[build-spa] vite build exited with code ${res.status} — checking for client bundle…`);
}

if (!existsSync(clientDir)) {
  console.error("[build-spa] dist/client missing — build failed before client assets were emitted.");
  process.exit(1);
}

// 2. Generate index.html from the Vite manifest if prerender didn't produce one.
if (!existsSync(indexHtml)) {
  const manifestPath = join(clientDir, ".vite", "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("[build-spa] No dist/client/index.html and no manifest.json — cannot recover.");
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  // Find the client entry chunk (isEntry true). Prefer one that looks like the
  // TanStack start client entry; otherwise pick the first entry.
  const entries = Object.values(manifest).filter((c) => c.isEntry);
  const entry = entries.find((c) => /client-entry|start|main/i.test(c.src || c.file)) || entries[0];
  if (!entry) {
    console.error("[build-spa] manifest has no entry chunk — cannot generate index.html.");
    process.exit(1);
  }

  const cssLinks = (entry.css || []).map((href) => `    <link rel="stylesheet" href="/${href}">`).join("\n");
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
  console.log(`[build-spa] Generated dist/client/index.html from manifest (entry: ${entry.file}).`);
}

// 3. Copy a 404 fallback equal to index.html so SPA routing works on Hostinger.
const notFound = join(clientDir, "404.html");
if (!existsSync(notFound)) {
  cpSync(indexHtml, notFound);
}

console.log("[build-spa] Done. Upload dist/client/* to Hostinger public_html.");
