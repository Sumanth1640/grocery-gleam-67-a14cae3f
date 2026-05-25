import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.hallifresh",
  appName: "HalliFresh",
  webDir: "dist/client",
  server: {
    // WebView wrapper: the APK loads the live Lovable app over HTTPS.
    // Requires internet. Publish the app in Lovable for this URL to serve content.
    url: "https://grocery-gleam-67.lovable.app?native=1",
    cleartext: false,
    androidScheme: "https",
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
