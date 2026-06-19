// Native + web local notifications.
// On Capacitor (Android/iOS native app) uses @capacitor/local-notifications.
// On the web falls back to the browser Notification API.
// NOTE: Local notifications only fire while the app process is alive
// (foreground or briefly backgrounded). They do NOT wake a fully closed app —
// that requires FCM/APNs.

let permissionRequested = false;

function isNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as any).Capacitor;
  return !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

export async function ensureNotifyPermission(): Promise<void> {
  if (permissionRequested) return;
  permissionRequested = true;
  try {
    if (isNative()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== "granted") {
        await LocalNotifications.requestPermissions();
      }
    } else if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  } catch {
    /* ignore */
  }
}

export async function notify(title: string, body: string): Promise<void> {
  try {
    if (isNative()) {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 2_147_483_647),
            title,
            body,
            smallIcon: "ic_stat_icon_config_sample",
          },
        ],
      });
      return;
    }
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  } catch {
    /* ignore */
  }
}
