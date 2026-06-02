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
  // Disable the Cloudflare/nitro deploy plugin — this is a static SPA build
  // for Hostinger. Without this, Vite emits a Cloudflare worker-entry instead
  // of the standard dist/server/server.js that the prerender step expects,
  // causing: ERR_MODULE_NOT_FOUND: Cannot find module dist/server/server.js
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
  },
});
