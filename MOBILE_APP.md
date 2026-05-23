# HalliFresh — Customer Mobile App (Capacitor)

The customer side of the web app is wrapped with **Capacitor** so it can ship
as a real Android (APK / Play Store) and iOS (IPA / App Store) app while
reusing 100% of the existing React code (home, food, cart, checkout,
account, orders, notifications).

The admin / partner / outlet dashboards are **not** part of the mobile build
— they continue to live on the web only.

## How it works

- `capacitor.config.ts` points the native shell at the live Lovable preview
  during development (hot reload on device). For production builds you bundle
  the static `dist/` output instead.
- `src/components/native/NativeInit.tsx` hides the splash screen, tints the
  status bar, and wires the Android hardware back button to the router.
- `src/lib/use-native.ts` exposes `useIsNative()` so any component can
  conditionally show/hide web-only UI.

## One-time setup (on your local machine, NOT in Lovable)

1. Export the project to GitHub (top-right "GitHub" button) and `git clone`
   it locally.
2. `npm install`
3. Add the platforms:
   ```bash
   npx cap add android
   npx cap add ios     # macOS only
   ```

## Build & run

**Hot-reload dev build** (uses the Lovable preview URL — no rebuild needed
when you change code in Lovable):

```bash
npx cap sync
npx cap run android        # or: npx cap run ios
```

**Production / store build** (fully offline-bundled app):

1. In `capacitor.config.ts`, delete the entire `server: { ... }` block.
2. ```bash
   npm run build
   npx cap sync
   npx cap open android    # opens Android Studio → Build → Generate APK / AAB
   npx cap open ios        # opens Xcode → Archive → upload to App Store
   ```

## Requirements

- **Android**: Android Studio + JDK 17
- **iOS**: macOS + Xcode 15+ + an Apple Developer account for store upload

## What changed in the web app?

Nothing user-visible. The web preview behaves exactly as before — Capacitor
APIs are only activated when `Capacitor.isNativePlatform()` is true, which is
only the case inside the native shell.
