/**
 * Native local-notification helper (Capacitor).
 * Safely no-ops on the web. Uses the device's native notification system
 * (status bar / lock screen / sound) on Android & iOS.
 */

type NotifyOptions = {
  title: string;
  body: string;
  /** Optional future time to fire the notification. */
  at?: Date;
  /** Stable id (number). Auto-generated if omitted. */
  id?: number;
  /** Custom payload available when the user taps the notification. */
  extra?: Record<string, unknown>;
};

let permissionGranted: boolean | null = null;
const listeners: Array<(payload: Record<string, unknown> | undefined) => void> = [];

async function getPlugin() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return null;
    const mod = await import("@capacitor/local-notifications");
    return mod.LocalNotifications;
  } catch (e) {
    console.warn("[native-notifications] plugin load failed", e);
    return null;
  }
}

export async function initNativeNotifications() {
  const plugin = await getPlugin();
  if (!plugin) return;

  try {
    const perm = await plugin.checkPermissions();
    if (perm.display !== "granted") {
      const req = await plugin.requestPermissions();
      permissionGranted = req.display === "granted";
    } else {
      permissionGranted = true;
    }

    // Create a default notification channel (Android 8+)
    try {
      await plugin.createChannel({
        id: "hallifresh-default",
        name: "Hallifresh",
        description: "Order updates, reminders, offers & alerts",
        importance: 5,
        visibility: 1,
        sound: undefined,
        vibration: true,
        lights: true,
      });
    } catch {
      // Channels not supported on iOS — ignore
    }

    // Forward taps to subscribers
    await plugin.addListener("localNotificationActionPerformed", (event: any) => {
      const extra = event.notification?.extra as Record<string, unknown> | undefined;
      listeners.forEach((fn) => fn(extra));
    });
  } catch (e) {
    console.warn("[native-notifications] init failed", e);
  }
}

export function onNotificationTap(fn: (extra: Record<string, unknown> | undefined) => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export async function notify(opts: NotifyOptions) {
  const plugin = await getPlugin();
  if (!plugin) return;
  if (permissionGranted === false) return;

  try {
    await plugin.schedule({
      notifications: [
        {
          id: opts.id ?? Math.floor(Date.now() % 2_000_000_000),
          title: opts.title,
          body: opts.body,
          channelId: "hallifresh-default",
          smallIcon: "ic_stat_icon_config_sample",
          schedule: opts.at ? { at: opts.at, allowWhileIdle: true } : undefined,
          extra: opts.extra ?? {},
        },
      ],
    });
  } catch (e) {
    console.warn("[native-notifications] schedule failed", e);
  }
}

export async function cancelNotification(id: number) {
  const plugin = await getPlugin();
  if (!plugin) return;
  try {
    await plugin.cancel({ notifications: [{ id }] });
  } catch {
    // ignore
  }
}
