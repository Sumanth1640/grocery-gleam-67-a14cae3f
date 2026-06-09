// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// IMPORTANT: Lovable preview & published deploys MUST use SSR mode (Cloudflare worker).
// SPA / static-only mode is ONLY for the separate Hostinger PHP static export, which
// is triggered by scripts/build-spa.mjs setting BUILD_SPA=1.
const SPA = process.env.BUILD_SPA === "1";

export default defineConfig(
  SPA
    ? {
        tanstackStart: {
          spa: { enabled: true, prerender: { outputPath: "/index.html" } },
          server: { preset: "static" },
        },
        vite: {
          build: {
            manifest: true,
            rollupOptions: {
              // Custom pure-CSR entry used by scripts/build-spa.mjs to bootstrap
              // the static Hostinger build (avoids hydrateRoot(document) which
              // throws "Invariant failed" against a plain <div id="root"> shell).
              input: { "spa-entry": "src/spa-entry.tsx" },
            },
          },
        },
      }
    : {
        vite: { build: { manifest: true } },
      },
);
