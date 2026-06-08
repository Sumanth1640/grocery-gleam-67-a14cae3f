# Native App Icons & Splash Screens

Master assets for HalliFresh native (Android/iOS) builds.

- `icon.png` — 1024×1024 app icon (master)
- `splash.png` — 2732×2732 splash (master, brand green background)

## Generate all sizes (run locally after `npx cap add android` / `ios`)

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor "#16a34a" --splashBackgroundColor "#16a34a"
npx cap sync
```

This generates every required Android (mipmap-*, drawable splash) and iOS
(AppIcon.appiconset, Splash.imageset) asset from these two masters and
copies them into the native projects.

To re-generate from a new design, replace `icon.png` / `splash.png` and
re-run the commands above.
