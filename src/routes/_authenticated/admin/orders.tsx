import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { Loader2, ChevronDown, ChevronRight, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["placed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];

type OrderRow = {
  id: string;
  user_id: string;
  status: Status;
  payment: string;
  subtotal: number;
  delivery: number;
  total: number;
  items: any;
  address: any;
  created_at: string;
  warehouse_id?: string | null;
  warehouse?: { name: string; code: string } | null;
};

const statusTint: Record<Status, string> = {
  placed: "bg-primary/10 text-primary",
  packed: "bg-brand/15 text-brand",
  out_for_delivery: "bg-warning/15 text-warning",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

function OrdersAdmin() {
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrderStatus);
  const qc = useQueryClient();
  const { session, loading: authLoading } = useAuth();
  const orders = useQuery({ queryKey: ["admin", "orders", session?.user.id], queryFn: () => list(), enabled: !authLoading && !!session, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false });
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");

  const mut = useMutation({
    mutationFn: (v: { id: string; status: Status }) => update({ data: v }),
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return ((orders.data as OrderRow[] | undefined) ?? []).filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!s) return true;
      const addr = (o.address ?? {}) as { full_name?: string; phone?: string; pincode?: string };
      return (
        o.id.toLowerCase().includes(s) ||
        (addr.full_name ?? "").toLowerCase().includes(s) ||
        (addr.phone ?? "").toLowerCase().includes(s) ||
        (addr.pincode ?? "").toLowerCase().includes(s)
      );
    });
  }, [orders.data, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order id, name, phone or pincode"
            className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-focus"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {authLoading || orders.isLoading ? (
        <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">No orders found.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((o) => {
            const items = (o.items ?? []) as { product: { name: string; image?: string }; qty: number }[];
            const isOpen = open === o.id;
            const addr = o.address ?? {};
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border bg-card shadow-card">
                <button
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/30"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusTint[o.status]}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground">· {new Date(o.created_at).toLocaleString()}</span>
                      {o.warehouse ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground" title={o.warehouse.name}>
                          🏬 {o.warehouse.code}
                        </span>
                      ) : (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">No warehouse</span>
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-semibold">
                      {addr.full_name ?? "—"} · {items.length} item{items.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-extrabold">₹{o.total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{o.payment}</div>
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t bg-secondary/20 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivering to</div>
                        <div className="mt-1 text-sm font-semibold">{addr.full_name} · {addr.phone}</div>
                        <div className="text-xs text-muted-foreground">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city} — {addr.pincode}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Update status</div>
                        <select
                          value={o.status}
                          onChange={(e) => mut.mutate({ id: o.id, status: e.target.value as Status })}
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                        </select>
                      </div>
                    </div>
                    <ul className="divide-y rounded-xl border bg-background">
                      {items.map((it, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 text-sm">
                          {it.product.image && <img src={it.product.image} alt="" className="h-10 w-10 rounded-md object-cover" />}
                          <div className="flex-1 font-semibold">{it.product.name}</div>
                          <div className="text-xs text-muted-foreground">× {it.qty}</div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end gap-6 text-xs text-muted-foreground">
                      <span>Subtotal ₹{o.subtotal}</span>
                      <span>Delivery {o.delivery > 0 ? `₹${o.delivery}` : "FREE"}</span>
                      <span className="font-bold text-foreground">Total ₹{o.total}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
