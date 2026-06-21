// Registers the device with FCM (via Capacitor) and POSTs the token to the
// PHP backend so server-side notifications can wake the app.
import { supabase } from "@/integrations/supabase/client";

const BACKEND_BASE =
  (typeof window !== "undefined" &&
    (window as any).__HALLIFRESH_API_BASE__) ||
  "https://hallifresh.in/php-backend/api";

export async function initNativePush(): Promise<void> {
  try {
    // Use variable specifiers + @vite-ignore so Rollup doesn't try to
    // resolve these Capacitor-only modules during the web SPA build.
    const coreSpec = "@capacitor/core";
    const pushSpec = "@capacitor/push-notifications";
    const { Capacitor } = await import(/* @vite-ignore */ coreSpec);
    if (!Capacitor.isNativePlatform()) return;

    const { PushNotifications } = await import(/* @vite-ignore */ pushSpec);

    const perm = await PushNotifications.checkPermissions();
    let status = perm.receive;
    if (status === "prompt" || status === "prompt-with-rationale") {
      const req = await PushNotifications.requestPermissions();
      status = req.receive;
    }
    if (status !== "granted") return;

    await PushNotifications.register();

    await PushNotifications.addListener("registration", async (token: any) => {
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

    await PushNotifications.addListener("registrationError", (err: any) => {
      console.warn("Push registration error", err);
    });

    // Foreground push: Android suppresses the system tray when app is open,
    // so surface it as a local notification ourselves.
    await PushNotifications.addListener(
      "pushNotificationReceived",
      async (notification: any) => {
        try {
          const localSpec = "@capacitor/local-notifications";
          const { LocalNotifications } = await import(/* @vite-ignore */ localSpec);
          await LocalNotifications.schedule({
            notifications: [
              {
                id: Math.floor(Math.random() * 2_000_000_000),
                title: notification?.title ?? notification?.data?.title ?? "Notification",
                body: notification?.body ?? notification?.data?.body ?? "",
                channelId: "default",
                extra: notification?.data ?? {},
              },
            ],
          });
        } catch (e) {
          console.warn("Foreground push -> local notification failed", e);
        }
      },
    );

    // When a push is tapped while app is in background -> route
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: any) => {
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
