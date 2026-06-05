import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dualApi } from "@/lib/dual-api";
import { toast } from "sonner";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { playAlert } from "@/lib/alert-sounds";
import { AlertSoundSettingsButton } from "@/components/admin/AlertSoundSettings";

const SOUND_KEY = "outlet-alert-sound";

/**
 * Polls the notifications feed for the signed-in outlet manager and plays a
 * sound + toast whenever the unread count or the latest notification id
 * changes. Also invalidates the outlet data queries so the UI refreshes.
 */
export function OutletAlerts() {
  const qc = useQueryClient();
  const [sound, setSound] = useState<boolean>(() =>
    typeof window === "undefined" ? true : localStorage.getItem(SOUND_KEY) !== "0",
  );
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
    if (typeof window !== "undefined") localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
  }, [sound]);

  const lastIdRef = useRef<string | null>(null);
  const primedRef = useRef(false);

  const q = useQuery({
    queryKey: ["outlet-notif-poll"],
    queryFn: async () => {
      const n: any = await dualApi.notifications();
      return n as { items?: Array<{ id: string; title: string; body: string; link?: string; kind?: string }>; unread?: number };
    },
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const items = q.data?.items ?? [];
    if (items.length === 0) return;
    const latest = items[0];
    if (!primedRef.current) {
      primedRef.current = true;
      lastIdRef.current = latest.id;
      return;
    }
    if (latest.id === lastIdRef.current) return;
    lastIdRef.current = latest.id;

    // Refresh outlet panel data
    qc.invalidateQueries({ queryKey: ["outlet-orders"] });
    qc.invalidateQueries({ queryKey: ["mgr-refunds"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications", "unread"] });

    if (soundRef.current) {
      const isOrder = (latest.kind ?? "") === "order" && /order/i.test(latest.title);
      playAlert(isOrder ? "admin_order" : "notification");
    }
    toast.success(latest.title, {
      description: latest.body,
      duration: 7000,
      action: latest.link
        ? { label: "Open", onClick: () => { window.location.href = latest.link!; } }
        : undefined,
    });
  }, [q.data, qc]);

  const unread = q.data?.unread ?? 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setSound((s) => !s)}
        title={sound ? "Mute alerts" : "Unmute alerts"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-secondary"
        aria-label="Toggle alert sound"
      >
        {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <AlertSoundSettingsButton
        rows={[
          { channel: "admin_order", label: "New order", description: "Plays when a new order arrives at your outlet." },
          { channel: "notification", label: "Other notifications", description: "Refund requests, status updates and general alerts." },
        ]}
      />
      <Link
        to="/notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-secondary"
        title="Notifications"
      >
        {sound ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Link>
    </div>
  );
}
