import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.hallifresh",
  appName: "HalliFresh",
  webDir: "dist/client",
  server: {
    // Hot-reload from the Lovable preview during development.
    // For a store-ready build, DELETE the entire `server` block, then run
    // `npm run build && npx cap sync` so the app ships fully offline.
    url: "https://16b78db9-75c1-4d38-8381-401bfdad3cb0.lovableproject.com?forceHideBadge=true&native=1",
    cleartext: true,
  },
  android: { backgroundColor: "#ffffff" },
  ios: { contentInset: "always" },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#ffffff",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: { style: "LIGHT", backgroundColor: "#16a34a" },
  },
};

export default config;
