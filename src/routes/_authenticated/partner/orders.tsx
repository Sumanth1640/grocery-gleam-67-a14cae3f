import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMemo, useState } from "react";
import { listMyRestaurantOrders, updateOrderStatus } from "@/lib/partner.functions";
import { Loader2, Clock, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/partner/orders")({
  component: PartnerOrdersPage,
});

const STATUSES = ["placed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];

const STATUS_LABEL: Record<Status, string> = {
  placed: "New",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TINT: Record<Status, string> = {
  placed: "bg-primary/15 text-primary",
  preparing: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  ready: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  out_for_delivery: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function PartnerOrdersPage() {
  const qc = useQueryClient();
  const listFn = useDualFn(listMyRestaurantOrders, (d) => php.partner.listMyRestaurantOrders(d));
  const updateFn = useDualFn(updateOrderStatus, (d) => php.partner.updateOrderStatus(d));
  const q = useQuery({
    queryKey: ["partner-orders"],
    queryFn: () => listFn(),
    refetchInterval: 15_000,
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      updateFn({ data: { id, status } }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["partner-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  const orders = (q.data ?? []) as unknown as Array<{
    id: string; status: string; total: number; subtotal: number; delivery: number;
    items: Array<{ name: string; qty: number; price: number }>; address: { full_name?: string; phone?: string; line1?: string; city?: string };
    created_at: string; payment: string;
  }>;

  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && (o.status as Status) !== filter) return false;
      if (!s) return true;
      return (
        o.id.toLowerCase().includes(s) ||
        (o.address?.full_name ?? "").toLowerCase().includes(s) ||
        (o.address?.phone ?? "").toLowerCase().includes(s)
      );
    });
  }, [orders, filter, search]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <div className="text-xs text-muted-foreground">Auto-refreshes every 15s</div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order id, customer, phone"
            className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-focus"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
                filter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          {orders.length === 0 ? "No orders yet. New orders will appear here automatically." : "No orders match your filters."}
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {filtered.map((o) => {
            const status = (o.status as Status) ?? "placed";
            const items = Array.isArray(o.items) ? o.items : [];
            return (
              <li key={o.id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_TINT[status]}`}>{STATUS_LABEL[status]}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-extrabold">₹{o.total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.payment}</div>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Items</div>
                    <ul className="mt-1 text-sm">
                      {items.map((it: any, i) => {
                        const name = it?.product?.name ?? it?.name ?? "Item";
                        const price = Number(it?.product?.price ?? it?.price ?? 0);
                        const qty = Number(it?.qty ?? 1);
                        return (
                          <li key={i} className="flex justify-between">
                            <span>{qty}× {name}</span>
                            <span className="text-muted-foreground">₹{price * qty}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Deliver to</div>
                    <div className="mt-1 text-sm">
                      <div className="font-semibold">{o.address?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.address?.phone}</div>
                      <div className="mt-1 text-xs">{o.address?.line1}, {o.address?.city}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={update.isPending || s === status}
                      onClick={() => update.mutate({ id: o.id, status: s })}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${s === status ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
