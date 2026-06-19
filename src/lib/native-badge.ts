// Sets the app icon badge count on native; no-op on web.
function isNative(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
}

export async function setBadge(count: number): Promise<void> {
  if (!isNative()) return;
  try {
    const { Badge } = await import("@capawesome/capacitor-badge");
    const perm = await Badge.checkPermissions().catch(() => ({ display: "granted" as const }));
    if (perm.display !== "granted") {
      const r = await Badge.requestPermissions().catch(() => ({ display: "denied" as const }));
      if (r.display !== "granted") return;
    }
    if (count > 0) await Badge.set({ count });
    else await Badge.clear();
  } catch {
    // plugin missing or unsupported — ignore
  }
}
