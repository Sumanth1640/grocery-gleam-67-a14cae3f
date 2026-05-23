import { useEffect } from "react";

/**
 * Initialises native-only behaviour when the app is running inside a
 * Capacitor shell (Android/iOS). On the web this is a no-op.
 *
 * - Hides the splash screen once React has mounted
 * - Tints the status bar to match the brand
 * - Wires the hardware back button to router history on Android
 */
export function NativeInit() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const [{ SplashScreen }, { StatusBar, Style }, { App }] = await Promise.all([
          import("@capacitor/splash-screen"),
          import("@capacitor/status-bar"),
          import("@capacitor/app"),
        ]);

        await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        await StatusBar.setBackgroundColor({ color: "#16a34a" }).catch(() => {});
        await SplashScreen.hide().catch(() => {});

        const handle = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else App.exitApp();
        });
        cleanup = () => handle.remove();
      } catch {
        // not in a native shell or plugin missing — safe to ignore
      }
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
