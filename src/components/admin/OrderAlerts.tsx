import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { toast } from "sonner";
import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { isAdmin as isAdminFn } from "@/lib/catalog.functions";
import { playAlert } from "@/lib/alert-sounds";
import { AlertSoundSettingsButton } from "./AlertSoundSettings";

const SOUND_KEY = "admin-alert-sound";
const SEEN_KEY = "admin-alert-seen";


/** Subscribes to all product (grocery) orders for admins, or only warehouse-scoped orders for managers. */
export function AdminOrderAlerts() {
  const qc = useQueryClient();
  const { session } = useAuth();
  const check = useDualFn(isAdminFn, (_d?: unknown) => php.checkRole());
  const { data: role } = useQuery({
    queryKey: ["is-admin", session?.user.id],
    queryFn: () => check(),
    enabled: !!session,
    refetchOnWindowFocus: false,
  });

  const [sound, setSound] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(SOUND_KEY) !== "0";
  });
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
    if (typeof window !== "undefined") localStorage.setItem(SOUND_KEY, sound ? "1" : "0");
  }, [sound]);

  const isAdminUser = !!role?.isAdmin;
  const warehouseIds = role?.warehouseIds ?? [];
  // Serialize for stable effect deps
  const whKey = warehouseIds.slice().sort().join(",");
  const token = session?.access_token;

  useEffect(() => {
    if (!session) return;
    if (!isAdminUser && warehouseIds.length === 0) return;

    // Ensure realtime is authenticated for RLS-aware postgres_changes
    if (token) {
      try {
        supabase.realtime.setAuth(token);
      } catch {
        /* ignore */
      }
    }

    const seenAt = Date.now();
    if (typeof window !== "undefined") sessionStorage.setItem(SEEN_KEY, String(seenAt));

    const invalidateAll = () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-assignable"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
      qc.invalidateQueries({ queryKey: ["admin-low-stock"] });
    };

    const insertHandler = (payload: { new: { id: string; total: number; created_at: string } }) => {
      const row = payload.new;
      invalidateAll();
      if (new Date(row.created_at).getTime() < seenAt - 5_000) return;
      if (soundRef.current) playAlert("admin_order");
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
    };

    const updateHandler = (payload: { new: { id: string; status?: string } }) => {
      // Status / payment updates — silently refresh dashboards & lists.
      invalidateAll();
    };


    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (isAdminUser) {
      const ch = supabase
        .channel("admin-product-orders")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders", filter: "restaurant_id=is.null" },
          insertHandler as never,
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: "restaurant_id=is.null" },
          updateHandler as never,
        )
        .subscribe((status) => {
          console.log("[AdminOrderAlerts] admin channel status:", status);
        });
      channels.push(ch);
    } else {
      for (const wid of warehouseIds) {
        const ch = supabase
          .channel(`wm-orders-${wid}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders", filter: `warehouse_id=eq.${wid}` },
            insertHandler as never,
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "orders", filter: `warehouse_id=eq.${wid}` },
            updateHandler as never,
          )
          .subscribe((status) => {
            console.log(`[AdminOrderAlerts] wm-${wid} channel status:`, status);
          });
        channels.push(ch);
      }
    }



    return () => {
      for (const ch of channels) void supabase.removeChannel(ch);
    };
  }, [qc, session, isAdminUser, whKey, token, warehouseIds]);

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
      <AlertSoundSettingsButton
        rows={[
          { channel: "admin_order", label: "New order", description: "Plays when a new product order arrives." },
          { channel: "notification", label: "Other notifications", description: "Status updates, low-stock and general alerts." },
        ]}
      />
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground"
        title="Order alerts"
      >
        {sound ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
      </span>

    </div>
  );
}
