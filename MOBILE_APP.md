# HalliFresh — Customer Mobile App (Capacitor)

The customer side of the web app is wrapped with **Capacitor** so it ships
as a real Android (APK / Play Store) and iOS (IPA / App Store) app while
reusing 100% of the existing React code: home, food, cart, checkout,
account, orders, notifications, bottom nav.

The admin / partner / outlet dashboards stay web-only.

## One-time setup (on YOUR machine — Lovable cannot build APK/IPA)

1. Top-right **GitHub → Connect / Open repo**, then `git clone` it locally.
2. `npm install`
3. Add the platforms:
   ```bash
   npx cap add android
   npx cap add ios     # macOS only
   ```

## Dev build (hot-reload on a real phone)

```bash
npx cap sync
npx cap run android        # or: npx cap run ios
```

The app opens on your device/emulator and hot-reloads from the Lovable
preview URL. Edit code in Lovable → see it on the phone immediately.

## Production / store build (offline-bundled)

1. In `capacitor.config.ts`, delete the entire `server: { … }` block.
2. ```bash
   npm run build
   npx cap sync
   npx cap open android    # Android Studio → Build → Generate Signed APK / AAB
   npx cap open ios        # Xcode → Archive → upload to App Store Connect
   ```

## Requirements

- **Android**: Android Studio + JDK 17
- **iOS**: macOS + Xcode 15+ + Apple Developer account

## What changed in the web app?

Nothing user-visible. Capacitor APIs only activate inside the native shell
(`Capacitor.isNativePlatform()`), so the Lovable preview and any normal
web deploy keep behaving exactly as before.
