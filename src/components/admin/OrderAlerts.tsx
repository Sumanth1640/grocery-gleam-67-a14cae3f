import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { dualApi, USE_PHP } from "@/lib/dual-api";
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
  const { session, user, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? user?.id ?? "unknown";
  const check = useDualFn(isAdminFn, (_d?: unknown) => php.checkRole());
  const { data: role } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: () => check(),
    enabled: !authLoading && !!session && !!user,
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
  const warehouseIds = useMemo(() => role?.warehouseIds ?? [], [role?.warehouseIds]);
  // Serialize for stable effect deps
  const whKey = warehouseIds.slice().sort().join(",");
  const token = session?.access_token;

  useEffect(() => {
    if (!session) return;
    if (!isAdminUser && warehouseIds.length === 0) return;

    const invalidateAll = () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-assignable"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
      qc.invalidateQueries({ queryKey: ["admin-low-stock"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
    };

    // PHP mode: poll instead of realtime; detect new order IDs to play alert sound.
    if (USE_PHP) {
      const seenIds = new Set<string>();
      let primed = false;
      const tick = async () => {
        invalidateAll();
        try {
          const rows = (await php.admin.listOrders()) as Array<{ id: string; total: number; created_at: string }>;
          const list = Array.isArray(rows) ? rows : [];
          if (!primed) {
            // Prime seen IDs from whatever exists right now (even if empty),
            // so the FIRST genuinely new order after page load triggers a toast.
            list.forEach((r) => { if (r.id) seenIds.add(r.id); });
            primed = true;
            return;
          }
          const fresh = list.filter((r) => r.id && !seenIds.has(r.id));
          list.forEach((r) => { if (r.id) seenIds.add(r.id); });
          for (const r of fresh) {
            if (soundRef.current) playAlert("admin_order");
            toast.success(`New product order — ₹${r.total}`, {
              description: `Order #${r.id.slice(0, 6)} just placed`,
              duration: 8000,
              action: { label: "Open", onClick: () => { window.location.href = "/admin/orders"; } },
            });
          }
        } catch { /* ignore */ }
      };
      void tick();
      const t = setInterval(tick, 15_000);
      return () => clearInterval(t);
    }

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

    const updateHandler = (_payload: { new: { id: string; status?: string } }) => {
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
            {
              event: "INSERT",
              schema: "public",
              table: "orders",
              filter: `warehouse_id=eq.${wid}`,
            },
            insertHandler as never,
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "orders",
              filter: `warehouse_id=eq.${wid}`,
            },
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
  const unreadQ = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const n = await dualApi.notifications();
      return (n as { unread?: number })?.unread ?? 0;
    },
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const unread = unreadQ.data ?? 0;
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
          {
            channel: "admin_order",
            label: "New order",
            description: "Plays when a new product order arrives.",
          },
          {
            channel: "notification",
            label: "Other notifications",
            description: "Status updates, low-stock and general alerts.",
          },
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
