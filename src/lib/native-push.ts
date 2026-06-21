// Registers the device with FCM (via Capacitor) and POSTs the token to the
// PHP backend so server-side notifications can wake the app.
import { supabase } from "@/integrations/supabase/client";

const BACKEND_BASE =
  (typeof window !== "undefined" &&
    (window as any).__HALLIFRESH_API_BASE__) ||
  "https://hallifresh.in/php-backend/api";

export async function initNativePush(): Promise<void> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.checkPermissions();
    let status = perm.receive;
    if (status === "prompt" || status === "prompt-with-rationale") {
      const req = await PushNotifications.requestPermissions();
      status = req.receive;
    }
    if (status !== "granted") return;

    await PushNotifications.register();

    await PushNotifications.addListener("registration", async (token) => {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id ?? null;
        await fetch(`${BACKEND_BASE}/notifications/register_token.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token.value,
            platform: Capacitor.getPlatform(),
            user_id: uid,
          }),
          credentials: "include",
        }).catch(() => {});
      } catch (e) {
        console.warn("FCM token POST failed", e);
      }
    });

    await PushNotifications.addListener("registrationError", (err) => {
      console.warn("Push registration error", err);
    });

    // When a push is tapped while app is in background -> route
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        const route =
          (action.notification.data?.route as string | undefined) ??
          "/notifications";
        try {
          window.location.assign(route);
        } catch {}
      },
    );
  } catch (e) {
    console.warn("initNativePush failed", e);
  }
}
