// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode — emits a static dist/client/index.html so the app can be hosted on
// plain static hosts (Hostinger shared, etc.) without a Node server.
// Note: we intentionally do NOT override `tanstackStart.server.entry` here.
// The custom src/server.ts wrapper is only useful when running SSR; overriding
// the entry breaks TanStack's SPA prerender preview server (which expects the
// default dist/server/server.js path).
export default defineConfig({
  // Disable the Cloudflare Worker build plugin for SPA/Hostinger builds.
  // The CF plugin hashes the server entry filename (e.g. server-XXXX.js),
  // but TanStack's SPA prerender preview server expects an unhashed
  // `dist/server/server.js`. Turning CF off keeps the canonical name so
  // prerender can boot and emit `dist/client/index.html`.
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
  },
});
