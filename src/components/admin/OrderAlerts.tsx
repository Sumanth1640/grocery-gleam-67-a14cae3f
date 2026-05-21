import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SOUND_KEY = "admin-alert-sound";
const SEEN_KEY = "admin-alert-seen";

function playBeep() {
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const tones = [660, 990, 1320];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 0.14);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.16);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    /* ignore */
  }
}

/** Subscribes to all product (grocery) orders — restaurant_id IS NULL. */
export function AdminOrderAlerts() {
  const qc = useQueryClient();
  const [sound, setSound] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SOUND_KEY) !== "0";
  });
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
    if (typeof window !== "undefined") localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
  }, [sound]);

  useEffect(() => {
    const seenAt = Date.now();
    if (typeof window !== "undefined") sessionStorage.setItem(SEEN_KEY, String(seenAt));

    const channel = supabase
      .channel("admin-product-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: "restaurant_id=is.null",
        },
        (payload) => {
          const row = payload.new as { id: string; total: number; created_at: string };
          if (new Date(row.created_at).getTime() < seenAt - 5_000) return;
          if (soundRef.current) playBeep();
          toast.success(`New product order — ₹${row.total}`, {
            description: `Order #${row.id.slice(0, 6)} just placed`,
            duration: 8000,
            action: {
              label: "Open",
              onClick: () => {
                window.location.href = "/admin/orders";
              },
            },
          });
          qc.invalidateQueries({ queryKey: ["admin-orders"] });
          qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return null;
}

export function AdminOrderAlertsControl() {
  const [sound, setSound] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SOUND_KEY) !== "0";
  });
  useEffect(() => {
    localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
  }, [sound]);

  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="hidden items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success sm:inline-flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Live
      </span>
      <button
        onClick={() => setSound((s) => !s)}
        title={sound ? "Mute order alerts" : "Unmute order alerts"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-secondary"
        aria-label="Toggle order alert sound"
      >
        {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground"
        title="Order alerts"
      >
        {sound ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </span>
    </div>
  );
}
