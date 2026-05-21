import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  partnerDashboard,
  toggleRestaurantOpen,
  updateOrderStatus,
} from "@/lib/partner.functions";
import {
  Loader2, Store, CheckCircle2, Clock, XCircle, ArrowRight,
  IndianRupee, ShoppingBag, TrendingUp, AlertTriangle, MapPin,
  UtensilsCrossed, Star, Power, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/partner/")({
  head: () => ({ meta: [{ title: "Dashboard — Partner portal" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(partnerDashboard);
  const q = useQuery({ queryKey: ["partner-dashboard"], queryFn: () => fn(), refetchInterval: 30_000 });

  if (q.isLoading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }
  const d = q.data;

  if (!d) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Store className="h-7 w-7" /></div>
        <h1 className="mt-4 font-display text-2xl font-bold">Welcome, partner!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Set up your restaurant profile to start receiving orders. Approval typically takes 24 hours.</p>
        <Link to="/partner/profile" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
          Create restaurant <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <HeroCard data={d} />
      <KpiGrid kpis={d.kpis} />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <RevenueChart series={d.series} />
        <TopDishes items={d.topDishes} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <RecentOrders orders={d.recentOrders} />
        <SideStack outlets={d.outlets} outOfStock={d.outOfStock} />
      </div>
    </div>
  );
}

// ---------- Hero / status ----------
function HeroCard({ data }: { data: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>> }) {
  const r = data.restaurant;
  const qc = useQueryClient();
  const toggleFn = useServerFn(toggleRestaurantOpen);
  const m = useMutation({
    mutationFn: (is_open: boolean) => toggleFn({ data: { is_open } }),
    onSuccess: (_d, is_open) => {
      toast.success(is_open ? "You're now accepting orders" : "You've paused new orders");
      qc.invalidateQueries({ queryKey: ["partner-dashboard"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  const statusMeta = r.status === "approved"
    ? { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Approved — live on freshcart" }
    : r.status === "rejected"
    ? { Icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected — update your details" }
    : { Icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "Pending review" };
  const { Icon } = statusMeta;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-1.5 rounded-full ${statusMeta.bg} px-3 py-1 text-xs font-bold ${statusMeta.color}`}>
            <Icon className="h-3.5 w-3.5" /> {statusMeta.label}
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">{r.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {(r.cuisines ?? []).join(" · ") || "—"} {r.area ? `· ${r.area}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-semibold"><Star className="h-3 w-3 text-warning" />{r.rating}★ ({r.reviews_count})</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-semibold"><Clock className="h-3 w-3" />{r.eta_mins}m</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-semibold">₹{r.cost_for_two} for two</span>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <button
            onClick={() => m.mutate(!r.is_open)}
            disabled={m.isPending || r.status !== "approved"}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-pop transition disabled:opacity-50 ${
              r.is_open ? "bg-success text-success-foreground hover:opacity-90" : "bg-muted text-foreground hover:bg-secondary"
            }`}
          >
            <Power className="h-4 w-4" />
            {r.is_open ? "Accepting orders" : "Paused — tap to open"}
          </button>
          <div className="flex gap-2">
            <Link to="/partner/orders" className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary">Orders</Link>
            <Link to="/partner/menu" className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary">Menu</Link>
            <Link to="/partner/outlets" className="rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary">Outlets</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- KPIs ----------
function KpiGrid({ kpis }: { kpis: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>>["kpis"] }) {
  const cards = [
    { label: "Today's revenue", value: `₹${kpis.todayRevenue.toLocaleString()}`, sub: `${kpis.todayOrders} orders`, Icon: IndianRupee, tone: "primary" as const },
    { label: "Pending orders", value: `${kpis.pendingOrders}`, sub: "needs attention", Icon: ShoppingBag, tone: kpis.pendingOrders > 0 ? "warn" : "neutral" as const },
    { label: "7-day revenue", value: `₹${kpis.revenue7.toLocaleString()}`, sub: `AOV ₹${kpis.aov}`, Icon: TrendingUp, tone: "success" as const },
    { label: "Out of stock", value: `${kpis.outOfStockCount}`, sub: `of ${kpis.dishCount} dishes`, Icon: AlertTriangle, tone: kpis.outOfStockCount > 0 ? "danger" : "neutral" as const },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.Icon;
        const tones: Record<string, string> = {
          primary: "bg-primary/10 text-primary",
          success: "bg-success/10 text-success",
          warn: "bg-warning/10 text-warning",
          danger: "bg-destructive/10 text-destructive",
          neutral: "bg-secondary text-muted-foreground",
        };
        return (
          <div key={c.label} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{c.label}</div>
                <div className="mt-1 font-display text-2xl font-extrabold">{c.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.sub}</div>
              </div>
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${tones[c.tone]}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Revenue chart ----------
function RevenueChart({ series }: { series: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>>["series"] }) {
  const max = Math.max(1, ...series.map((s) => s.revenue));
  const total = series.reduce((s, p) => s + p.revenue, 0);
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Last 7 days</h2>
          <p className="text-xs text-muted-foreground">Daily revenue trend</p>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-extrabold">₹{total.toLocaleString()}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</div>
        </div>
      </div>
      <div className="mt-5 flex h-44 items-end gap-2">
        {series.map((p) => {
          const pct = Math.round((p.revenue / max) * 100);
          return (
            <div key={p.day} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 transition hover:opacity-90"
                  style={{ height: `${Math.max(pct, 4)}%` }}
                  title={`₹${p.revenue} · ${p.count} orders`}
                />
              </div>
              <div className="text-[10px] font-semibold text-muted-foreground">{p.label}</div>
              <div className="text-[10px] font-bold">₹{p.revenue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Top dishes ----------
function TopDishes({ items }: { items: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>>["topDishes"] }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Top sellers</h2>
          <p className="text-xs text-muted-foreground">Most-ordered, last 7 days</p>
        </div>
        <Link to="/partner/menu" className="text-xs font-semibold text-primary hover:underline">Menu →</Link>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.length === 0 && <li className="text-xs text-muted-foreground">No orders in the last 7 days yet.</li>}
        {items.map((it, i) => (
          <li key={it.name + i} className="flex items-center gap-3 rounded-xl border bg-secondary/30 p-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
            {it.image
              ? <img src={it.image} alt="" className="h-10 w-10 rounded-md object-cover" />
              : <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary"><UtensilsCrossed className="h-4 w-4 text-muted-foreground" /></div>}
            <div className="min-w-0 flex-1">
              <div className="line-clamp-1 text-sm font-semibold">{it.name}</div>
              <div className="text-[11px] text-muted-foreground">{it.qty} sold</div>
            </div>
            <div className="text-sm font-bold">₹{it.revenue}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Recent orders with inline status update ----------
const NEXT: Record<string, { label: string; next: string } | null> = {
  placed: { label: "Start preparing", next: "preparing" },
  preparing: { label: "Mark ready", next: "ready" },
  ready: { label: "Out for delivery", next: "out_for_delivery" },
  out_for_delivery: { label: "Mark delivered", next: "delivered" },
  delivered: null,
  cancelled: null,
};
const STATUS_TONE: Record<string, string> = {
  placed: "bg-primary/10 text-primary",
  preparing: "bg-warning/10 text-warning",
  ready: "bg-success/10 text-success",
  out_for_delivery: "bg-blue-500/10 text-blue-600",
  delivered: "bg-secondary text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

function RecentOrders({ orders }: { orders: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>>["recentOrders"] }) {
  const qc = useQueryClient();
  const updateFn = useServerFn(updateOrderStatus);
  const m = useMutation({
    mutationFn: (v: { id: string; status: "placed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled" }) =>
      updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-dashboard"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Recent orders</h2>
          <p className="text-xs text-muted-foreground">Last 7 days · live updates every 30s</p>
        </div>
        <Link to="/partner/orders" className="text-xs font-semibold text-primary hover:underline">All orders →</Link>
      </div>
      <ul className="mt-4 divide-y">
        {orders.length === 0 && (
          <li className="py-8 text-center text-xs text-muted-foreground">No orders yet — they'll show up here in real time.</li>
        )}
        {orders.map((o) => {
          const addr = (o.address as { full_name?: string } | null) ?? {};
          const itemCount = Array.isArray(o.items) ? (o.items as Array<{ qty?: number }>).reduce((s, it) => s + (it.qty ?? 0), 0) : 0;
          const next = NEXT[o.status];
          return (
            <li key={o.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold text-muted-foreground">#{o.id.slice(0, 6)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_TONE[o.status] ?? "bg-secondary"}`}>{o.status.replace(/_/g, " ")}</span>
                </div>
                <div className="mt-0.5 line-clamp-1 text-sm font-semibold">{addr.full_name ?? "Customer"} · {itemCount} item{itemCount === 1 ? "" : "s"}</div>
                <div className="text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleString()} · {o.payment.toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-sm font-extrabold">₹{o.total}</div>
                {next ? (
                  <button
                    onClick={() => m.mutate({ id: o.id, status: next.next as "preparing" })}
                    disabled={m.isPending}
                    className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {next.label} <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <div className="mt-1 text-[10px] font-semibold text-muted-foreground">—</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------- Side stack: outlets + out-of-stock ----------
function SideStack({
  outlets,
  outOfStock,
}: {
  outlets: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>>["outlets"];
  outOfStock: NonNullable<Awaited<ReturnType<typeof partnerDashboard>>>["outOfStock"];
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Outlets</h2>
            <p className="text-xs text-muted-foreground">{outlets.length} location{outlets.length === 1 ? "" : "s"}</p>
          </div>
          <Link to="/partner/outlets" className="text-xs font-semibold text-primary hover:underline">Manage →</Link>
        </div>
        <ul className="mt-3 space-y-2">
          {outlets.length === 0 && (
            <li className="rounded-xl border border-dashed bg-secondary/30 p-3 text-xs text-muted-foreground">
              No outlets yet. Add one so we can route orders by pincode.
            </li>
          )}
          {outlets.map((o) => (
            <li key={o.id} className="flex items-center gap-3 rounded-xl border bg-secondary/30 p-2.5">
              <div className={`grid h-8 w-8 place-items-center rounded-lg ${o.is_active && o.is_open ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-semibold">{o.name}</div>
                <div className="text-[11px] text-muted-foreground">{o.area || "—"} · {o.pincode || "—"} · {o.eta_mins}m</div>
              </div>
              <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${o.is_open ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {o.is_open ? "Open" : "Closed"}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">Out of stock</h2>
            <p className="text-xs text-muted-foreground">Hidden from customers</p>
          </div>
          <Link to="/partner/menu" className="text-xs font-semibold text-primary hover:underline">Menu →</Link>
        </div>
        <ul className="mt-3 space-y-2">
          {outOfStock.length === 0 && (
            <li className="rounded-xl border border-dashed bg-success/5 p-3 text-xs font-semibold text-success">
              All dishes are in stock 🎉
            </li>
          )}
          {outOfStock.map((d) => (
            <li key={d.id} className="flex items-center gap-3 rounded-xl border bg-secondary/30 p-2.5">
              {d.image
                ? <img src={d.image} alt="" className="h-9 w-9 rounded-md object-cover" />
                : <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary"><UtensilsCrossed className="h-4 w-4 text-muted-foreground" /></div>}
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-sm font-semibold">{d.name}</div>
                <div className="text-[11px] text-muted-foreground">₹{d.price}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
