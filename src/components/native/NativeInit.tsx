import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { initNativeNotifications, notify, onNotificationTap } from "@/lib/native-notifications";
import { orderStore } from "@/lib/order-store";

/**
 * Initialises native-only behaviour when running inside Capacitor.
 * On the web this is a no-op.
 */
export function NativeInit() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const [{ SplashScreen }, { StatusBar, Style }, { App }, { Browser }] = await Promise.all([
          import("@capacitor/splash-screen"),
          import("@capacitor/status-bar"),
          import("@capacitor/app"),
          import("@capacitor/browser"),
        ]);

        await StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        await StatusBar.setBackgroundColor({ color: "#16a34a" }).catch(() => {});
        await SplashScreen.hide().catch(() => {});

        const backHandle = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else App.exitApp();
        });
        cleanups.push(() => backHandle.remove());

        // Handle deep links: hallifresh://auth#access_token=...&refresh_token=...
        const urlHandle = await App.addListener("appUrlOpen", async ({ url }) => {
          try {
            if (!url.startsWith("hallifresh://auth")) return;
            // Tokens may be in hash or query string
            const fragment = url.split("#")[1] ?? url.split("?")[1] ?? "";
            const params = new URLSearchParams(fragment);
            await Browser.close().catch(() => {});
            const expectedState = localStorage.getItem("native-oauth-state");
            const incomingState = params.get("state");
            if (expectedState && incomingState && expectedState !== incomingState) {
              toast.error("Sign-in failed: security check did not match");
              return;
            }
            localStorage.removeItem("native-oauth-state");

            const error = params.get("error_description") || params.get("error");
            if (error) {
              toast.error("Sign-in failed: " + error);
              return;
            }

            const access_token = params.get("access_token");
            const refresh_token = params.get("refresh_token");
            if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({ access_token, refresh_token });
              if (error) {
                toast.error("Sign-in failed: " + error.message);
                return;
              }
              toast.success("Signed in!");
              window.location.replace("/");
              return;
            }
            // PKCE code flow
            const code = params.get("code");
            if (code) {
              const { error } = await supabase.auth.exchangeCodeForSession(code);
              if (error) {
                toast.error("Sign-in failed: " + error.message);
                return;
              }
              toast.success("Signed in!");
              window.location.replace("/");
            }
          } catch (e) {
            toast.error("Could not complete sign-in");
            console.error("appUrlOpen handler:", e);
          }
        });
        cleanups.push(() => urlHandle.remove());
      } catch {
        // not a native shell — ignore
      }
    })();

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
