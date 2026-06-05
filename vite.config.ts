// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// NOTE: SPA / static-only mode broke the Lovable preview & published deploys
// (Cloudflare worker SSR bundle failed with `No such module "assets/h3-v2"`).
// For Hostinger / PHP static export, run the separate scripts/build-spa.mjs
// pipeline instead of forcing the main Vite config into SPA mode.
export default defineConfig({
  vite: {
    build: { manifest: true },
  },
});
