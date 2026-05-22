import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { myRestaurant } from "@/lib/partner.functions";

const SOUND_KEY = "partner-alert-sound";
const PUSH_KEY = "partner-alert-push";
const SEEN_KEY = "partner-alert-seen";

// Synthesize a short two-tone beep via WebAudio — no asset required.
function playBeep() {
  try {
    type WindowWithWebkit = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctx = window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const tones = [880, 1320];
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.18 + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.18);
    });
    setTimeout(() => ctx.close(), 700);
  } catch {
    /* ignore */
  }
}

function showBrowserNotification(title: string, body: string, orderId: string) {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const n = new Notification(title, {
      body,
      tag: `order-${orderId}`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
    n.onclick = () => {
      window.focus();
      window.location.href = "/partner/orders";
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function OrderAlerts() {
  const qc = useQueryClient();
  const myFn = useServerFn(myRestaurant);
  const r = useQuery({ queryKey: ["my-restaurant"], queryFn: () => myFn() });

  const [sound, setSound] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SOUND_KEY) !== "0";
  });
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
    if (typeof window !== "undefined") localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
  }, [sound]);

  const restaurantId = r.data?.id;

  useEffect(() => {
    if (!restaurantId) return;

    // Mark the moment we attached so we don't alert on historical orders.
    const seenAt = Date.now();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SEEN_KEY, String(seenAt));
    }

    const channel = supabase
      .channel(`partner-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; total: number; created_at: string };
          if (new Date(row.created_at).getTime() < seenAt - 5_000) return;
          if (soundRef.current) playBeep();
          const pushOn = typeof window !== "undefined" && localStorage.getItem(PUSH_KEY) === "1";
          if (pushOn) {
            showBrowserNotification(
              `New order — ₹${row.total}`,
              `Tap to view order #${row.id.slice(0, 6)}`,
              row.id,
            );
          }
          toast.success(`New order — ₹${row.total}`, {
            description: `Tap to view order #${row.id.slice(0, 6)}`,
            duration: 8000,
            action: {
              label: "Open",
              onClick: () => {
                window.location.href = "/partner/orders";
              },
            },
          });
          // Refresh dashboard + orders queries
          qc.invalidateQueries({ queryKey: ["partner-dashboard"] });
          qc.invalidateQueries({ queryKey: ["my-restaurant-orders"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, qc]);

  if (!restaurantId) return null;

  return (
    <Link
      to="/partner/orders"
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="hidden"
      aria-hidden
    />
  );
}

/** Compact header control: live indicator + sound + browser-push toggles. */
export function OrderAlertsControl() {
  const [sound, setSound] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SOUND_KEY) !== "0";
  });
  const [push, setPush] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(PUSH_KEY) === "1"
      && typeof Notification !== "undefined"
      && Notification.permission === "granted";
  });

  useEffect(() => {
    localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
  }, [sound]);
  useEffect(() => {
    localStorage.setItem(PUSH_KEY, push ? "1" : "0");
  }, [push]);

  const supportsPush = typeof window !== "undefined" && "Notification" in window;

  const togglePush = async () => {
    if (!supportsPush) {
      toast.error("Browser notifications not supported on this device");
      return;
    }
    if (push) {
      setPush(false);
      toast.success("Browser alerts muted");
      return;
    }
    if (Notification.permission === "granted") {
      setPush(true);
      toast.success("Browser alerts enabled");
      return;
    }
    if (Notification.permission === "denied") {
      toast.error("Notifications blocked. Enable them in your browser site settings.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setPush(true);
      toast.success("Browser alerts enabled");
      try { new Notification("Alerts on", { body: "You'll be notified for new orders.", icon: "/favicon.ico" }); } catch { /* ignore */ }
    } else {
      toast.error("Permission denied");
    }
  };

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
        title={sound ? "Mute order sounds" : "Unmute order sounds"}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-secondary"
      >
        {sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <button
        onClick={togglePush}
        title={push ? "Disable browser alerts" : "Enable browser alerts"}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-secondary ${push ? "bg-primary/10 text-primary border-primary/30" : "bg-card"}`}
      >
        {push ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </button>
      <Link
        to="/partner/orders"
        title="Open orders"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-secondary text-[10px] font-bold"
      >
        →
      </Link>
    </div>
  );
}
