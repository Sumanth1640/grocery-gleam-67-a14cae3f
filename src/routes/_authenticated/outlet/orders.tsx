import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Clock, Search, Printer } from "lucide-react";
import { myManagedOutlets, listOutletOrders, updateOutletOrderStatus } from "@/lib/outlet-managers.functions";

const searchSchema = z.object({ outlet: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/outlet/orders")({
  validateSearch: (s) => searchSchema.parse(s),
  component: OutletOrdersPage,
});

const STATUSES = ["placed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];
const STATUS_LABEL: Record<Status, string> = {
  placed: "New", preparing: "Preparing", ready: "Ready",
  out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled",
};
const STATUS_TINT: Record<Status, string> = {
  placed: "bg-primary/15 text-primary",
  preparing: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  ready: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  out_for_delivery: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
};

function OutletOrdersPage() {
  const qc = useQueryClient();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const outletsFn = useDualFn(myManagedOutlets, (d) => php.outletMgr.myManagedOutlets(d));
  const listFn = useDualFn(listOutletOrders, (d) => php.outletMgr.listOutletOrders(d));
  const updFn = useDualFn(updateOutletOrderStatus, (d) => php.outletMgr.updateOutletOrderStatus(d));

  const o = useQuery({ queryKey: ["my-managed-outlets"], queryFn: () => outletsFn() });
  const ord = useQuery({
    queryKey: ["outlet-orders", search.outlet ?? "all"],
    queryFn: () => listFn({ data: { outlet_id: search.outlet } }),
    refetchInterval: 15_000,
  });
  const update = useMutation({
    mutationFn: (v: { id: string; status: Status }) => updFn({ data: v }),
    onSuccess: () => { toast.success("Order updated"); qc.invalidateQueries({ queryKey: ["outlet-orders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");

  const orders = (ord.data ?? []) as unknown as Array<{
    id: string; status: string; total: number; outlet_id: string;
    items: Array<{ name: string; qty: number; price: number }>; address: { full_name?: string; phone?: string; line1?: string; city?: string };
    created_at: string; payment: string;
  }>;
  const outlets = o.data ?? [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((x) => {
      if (filter !== "all" && (x.status as Status) !== filter) return false;
      if (!s) return true;
      return x.id.toLowerCase().includes(s) || (x.address?.full_name ?? "").toLowerCase().includes(s) || (x.address?.phone ?? "").toLowerCase().includes(s);
    });
  }, [orders, filter, q]);

  if (ord.isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <div className="text-xs text-muted-foreground">Auto-refreshes every 15s</div>
      </div>

      {outlets.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button onClick={() => navigate({ search: {} })} className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${!search.outlet ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>All</button>
          {outlets.map((m) => (
            <button key={m.outlet_id} onClick={() => navigate({ search: { outlet: m.outlet_id } })}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${search.outlet === m.outlet_id ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
              {m.outlet?.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search id, customer, phone"
            className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-focus" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...STATUSES] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${filter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
              {s === "all" ? "All" : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          {orders.length === 0 ? "No orders yet. New orders for your outlet will appear here." : "No orders match your filters."}
        </div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {filtered.map((x) => {
            const status = (x.status as Status) ?? "placed";
            const items = Array.isArray(x.items) ? x.items : [];
            return (
              <li key={x.id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs text-muted-foreground">#{x.id.slice(0, 8)}</div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_TINT[status]}`}>{STATUS_LABEL[status]}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(x.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-extrabold">₹{x.total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.payment}</div>
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
                      <div className="font-semibold">{x.address?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{x.address?.phone}</div>
                      <div className="mt-1 text-xs">{x.address?.line1}, {x.address?.city}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                  {STATUSES.map((s) => (
                    <button key={s} disabled={update.isPending || s === status}
                      onClick={() => update.mutate({ id: x.id, status: s })}
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${s === status ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                  <button
                    onClick={() => printKOT(x)}
                    className="ml-auto inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary"
                    title="Print kitchen ticket"
                  >
                    <Printer className="h-3.5 w-3.5" /> KOT
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

type KOTOrder = {
  id: string; status: string; total: number; created_at: string; payment: string;
  items: Array<{ name: string; qty: number; price: number }>;
  address: { full_name?: string; phone?: string; line1?: string; city?: string };
};

function printKOT(x: KOTOrder) {
  const items = Array.isArray(x.items) ? x.items : [];
  const rows = items.map((it: any) => `
    <tr>
      <td style="padding:4px 0;font-weight:700;width:38px;">${it?.qty ?? 1}×</td>
      <td style="padding:4px 0;">${escapeHtml(it?.product?.name ?? it?.name ?? "Item")}</td>
    </tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>KOT #${x.id.slice(0, 8)}</title>
    <style>
      @media print { @page { size: 80mm auto; margin: 4mm; } body { margin: 0; } }
      body { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #000; font-size: 13px; width: 72mm; }
      h1 { text-align:center; margin: 0 0 4px; font-size: 16px; letter-spacing: 2px; }
      .sub { text-align:center; font-size: 11px; margin-bottom: 8px; }
      hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
      table { width: 100%; border-collapse: collapse; }
      .meta { font-size: 11px; line-height: 1.4; }
      .foot { margin-top: 6px; font-size: 11px; text-align: center; }
    </style></head><body>
      <h1>KOT</h1>
      <div class="sub">#${x.id.slice(0, 8).toUpperCase()} · ${new Date(x.created_at).toLocaleString()}</div>
      <hr />
      <div class="meta">
        <div><b>Customer:</b> ${escapeHtml(x.address?.full_name ?? "—")}</div>
        <div><b>Phone:</b> ${escapeHtml(x.address?.phone ?? "—")}</div>
        <div><b>Addr:</b> ${escapeHtml((x.address?.line1 ?? "") + ", " + (x.address?.city ?? ""))}</div>
        <div><b>Payment:</b> ${escapeHtml(x.payment)} · <b>Status:</b> ${escapeHtml(x.status)}</div>
      </div>
      <hr />
      <table>${rows}</table>
      <hr />
      <div class="foot">Total ₹${x.total}</div>
      <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); };</script>
    </body></html>`;
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

