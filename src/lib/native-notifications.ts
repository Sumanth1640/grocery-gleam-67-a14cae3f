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

type PermissionState = "prompt" | "prompt-with-rationale" | "granted" | "denied";
type LocalNotificationsPlugin = {
  checkPermissions: () => Promise<{ display: PermissionState }>;
  requestPermissions: () => Promise<{ display: PermissionState }>;
  createChannel: (options: {
    id: string;
    name: string;
    description?: string;
    importance?: number;
    visibility?: number;
    sound?: string;
    vibration?: boolean;
    lights?: boolean;
  }) => Promise<void>;
  addListener: (
    eventName: "localNotificationActionPerformed",
    listenerFunc: (event: { notification?: { extra?: Record<string, unknown> } }) => void,
  ) => Promise<{ remove: () => Promise<void> }>;
  schedule: (options: {
    notifications: Array<{
      id: number;
      title: string;
      body: string;
      channelId?: string;
      smallIcon?: string;
      schedule?: { at: Date; allowWhileIdle?: boolean };
      extra?: Record<string, unknown>;
    }>;
  }) => Promise<void>;
  cancel: (options: { notifications: Array<{ id: number }> }) => Promise<void>;
};

let permissionGranted: boolean | null = null;
const listeners: Array<(payload: Record<string, unknown> | undefined) => void> = [];
const NOTIFICATION_CHANNEL_ID = "hallifresh-default";
const NOTIFICATION_SMALL_ICON = "ic_stat_hallifresh";

async function getPlugin() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return null;
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    return LocalNotifications as LocalNotificationsPlugin;
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
        id: NOTIFICATION_CHANNEL_ID,
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
    await plugin.addListener("localNotificationActionPerformed", (event) => {
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
          channelId: NOTIFICATION_CHANNEL_ID,
          smallIcon: NOTIFICATION_SMALL_ICON,
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
