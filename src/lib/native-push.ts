// Registers the device with FCM (via Capacitor) and POSTs the token to the
// PHP backend so server-side notifications can wake the app.
import { supabase } from "@/integrations/supabase/client";
import { phpAuth } from "@/lib/php-api";

const PUSH_CHANNEL_ID = "hallifresh-default";
const PUSH_SMALL_ICON = "ic_stat_hallifresh";
let listenersAttached = false;
let lastTokenPostKey: string | null = null;

function jwtSub(token: string | null): string | null {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") ?? ""));
    return typeof payload?.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

async function postToken(tokenValue: string, platform: string) {
  if (!tokenValue) return;
  const { data } = await supabase.auth.getUser();
  const phpToken = phpAuth.get();
  const uid = jwtSub(phpToken) ?? data.user?.id ?? null;
  const postKey = JSON.stringify([tokenValue, platform, phpToken ?? "", uid ?? ""]);
  if (lastTokenPostKey === postKey) return;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (phpToken) headers.Authorization = `Bearer ${phpToken}`;
  const body = JSON.stringify({ token: tokenValue, platform, user_id: uid });
  for (const base of backendCandidates()) {
    try {
      const response = await fetch(`${base}/notifications/register_token.php`, {
        method: "POST",
        headers,
        body,
        credentials: "include",
      });
      if (response.ok) {
        lastTokenPostKey = postKey;
        try {
          localStorage.setItem("hallifresh_fcm_token", tokenValue);
        } catch {}
        return;
      }
      const text = await response.text().catch(() => "");
      console.warn("FCM token registration failed", base, response.status, text.slice(0, 160));
    } catch (error) {
      console.warn("FCM token registration network error", base, error);
    }
  }
}

const BACKEND_BASE =
  (typeof window !== "undefined" &&
    (window as any).__HALLIFRESH_API_BASE__) ||
  "https://hallifresh.in/php-backend/api";

function backendCandidates(): string[] {
  const configured = (import.meta.env.VITE_PHP_API_BASE as string | undefined)?.replace(/\/$/, "");
  const candidates = [configured, BACKEND_BASE, "/php-backend/api", "/api"].filter(Boolean) as string[];
  return [...new Set(candidates)];
}

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

    try {
      await Promise.all([
        PushNotifications.createChannel?.({
          id: PUSH_CHANNEL_ID,
          name: "Hallifresh",
          description: "Order updates, reminders, offers & alerts",
          importance: 5,
          visibility: 1,
          vibration: true,
          lights: true,
        }),
        PushNotifications.createChannel?.({
          id: "default",
          name: "Hallifresh",
          description: "Order updates, reminders, offers & alerts",
          importance: 5,
          visibility: 1,
          vibration: true,
          lights: true,
        }),
      ]);
    } catch {}

    if (!listenersAttached) {
      listenersAttached = true;
      await PushNotifications.addListener("registration", async (token: any) => {
        try {
          try {
            localStorage.setItem("hallifresh_fcm_token", token.value);
          } catch {}
          await postToken(token.value, Capacitor.getPlatform());
        } catch (e) {
          console.warn("FCM token POST failed", e);
        }
      });

      await PushNotifications.addListener("registrationError", (err: any) => {
        console.warn("Push registration error", err);
      });

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

      // Foreground push: Android suppresses the system tray when app is open,
      // so surface it as a local notification ourselves.
      await PushNotifications.addListener(
        "pushNotificationReceived",
        async (notification: any) => {
          try {
            const { notify } = await import("@/lib/native-notifications");
            await notify({
              id: Math.floor(Math.random() * 2_000_000_000),
              title: notification?.title ?? notification?.data?.title ?? "Notification",
              body: notification?.body ?? notification?.data?.body ?? "",
              extra: notification?.data ?? {},
            });
          } catch (e) {
            console.warn("Foreground push -> local notification failed", e);
          }
        },
      );
    }

    try {
      const cachedToken = localStorage.getItem("hallifresh_fcm_token");
      if (cachedToken) {
        await postToken(cachedToken, Capacitor.getPlatform());
      }
    } catch {}

    await PushNotifications.register();

  } catch (e) {
    console.warn("initNativePush failed", e);
  }
}
