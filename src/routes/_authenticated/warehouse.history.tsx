import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { php } from "@/lib/php-api";
import { useMemo, useState } from "react";
import { Loader2, ArrowLeft, Warehouse, Search, Bike, CheckCircle2, Truck, Clock, UserX } from "lucide-react";

export const Route = createFileRoute("/_authenticated/warehouse/history")({
  head: () => ({ meta: [{ title: "Assignment history — Warehouse panel" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { phpAuth } = await import("@/lib/php-api");
    if (!phpAuth.get()) throw redirect({ to: "/login", search: { redirect: location.href } });
    throw redirect({ to: "/admin/assignment-history", replace: true });
  },
  component: WarehouseHistoryPage,
});

function WarehouseHistoryPage() {
  return <WarehouseHistoryBody />;
}

type Status = "assigned" | "picked_up" | "delivered";
const STATUS_LABEL: Record<string, string> = {
  assigned: "Assigned",
  picked_up: "Picked up",
  delivered: "Delivered",
};
const STATUS_TINT: Record<string, string> = {
  assigned: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  picked_up: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  delivered: "bg-success/15 text-success",
};

function fmt(d?: string | null) {
  if (!d) return "—";
  try { return new Date(d).toLocaleString(); } catch { return "—"; }
}

export function WarehouseHistoryBody({ embedded = false }: { embedded?: boolean }) {
  const wh = useQuery({ queryKey: ["wh-mgr-warehouses"], queryFn: () => php.warehouseMgr.myWarehouses() });
  const warehouses = (wh.data ?? []) as Array<{ id: string; name: string; code: string }>;
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const hist = useQuery({
    queryKey: ["wh-mgr-history", selected ?? "all"],
    queryFn: () => php.warehouseMgr.assignmentHistory({ warehouse_id: selected }),
    enabled: warehouses.length > 0,
    refetchInterval: 20_000,
  });

  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");

  const rows = (hist.data ?? []) as any[];
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((x) => {
      if (filter !== "all" && x.status !== filter) return false;
      if (!s) return true;
      return (
        String(x.order_id).toLowerCase().includes(s) ||
        (x.rider?.name ?? "").toLowerCase().includes(s) ||
        (x.rider?.phone ?? "").toLowerCase().includes(s) ||
        (x.order?.address?.full_name ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, filter, q]);

  if (wh.isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }
  if (!warehouses.length) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
          <Warehouse className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-xl font-bold">No warehouses assigned</h1>
          <Link to="/" className="mt-5 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-muted/30 pb-24"}>
      {!embedded && (
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
            <Link to="/warehouse" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Warehouse
            </Link>
            <div className="ml-2 flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Warehouse className="h-3.5 w-3.5" /></div>
              <div className="font-display text-sm font-bold leading-none">Assignment history</div>
            </div>
          </div>
        </header>
      )}

      <main className={embedded ? "" : "mx-auto max-w-6xl px-4 py-6"}>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Rider assignments</h1>
          <div className="text-xs text-muted-foreground">{filtered.length} record(s)</div>
        </div>

        {warehouses.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button onClick={() => setSelected(undefined)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${!selected ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>All</button>
            {warehouses.map((w) => (
              <button key={w.id} onClick={() => setSelected(w.id)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${selected === w.id ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
                {w.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, rider, customer"
              className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-focus" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "assigned", "picked_up", "delivered"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide ${filter === s ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
                {s === "all" ? "All" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {hist.isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
            No assignment records yet.
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {filtered.map((x: any) => {
              const orderCancelled = x.order?.status === "cancelled";
              return (
                <li key={x.id} className="rounded-2xl border bg-card p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-xs text-muted-foreground">#{String(x.order_id).slice(0, 8)}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_TINT[x.status] ?? "bg-secondary text-muted-foreground"}`}>
                          {STATUS_LABEL[x.status] ?? x.status}
                        </span>
                        {orderCancelled && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                            <UserX className="h-3 w-3" /> Unassigned (order cancelled)
                          </span>
                        )}
                        {x.warehouse?.code && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                            {x.warehouse.code}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Customer: <span className="font-semibold text-foreground">{x.order?.address?.full_name ?? "—"}</span>
                        {x.order?.address?.phone ? ` · ${x.order.address.phone}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-base font-extrabold">₹{x.order?.total ?? 0}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.order?.payment}</div>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border bg-muted/20 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rider</div>
                      {x.rider ? (
                        <div className="mt-1 text-sm">
                          <div className="font-semibold">{x.rider.name}</div>
                          <div className="text-xs text-muted-foreground">{x.rider.phone}</div>
                          <div className="text-xs text-muted-foreground">{x.rider.vehicle} {x.rider.vehicle_no}</div>
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-muted-foreground">Rider record removed</div>
                      )}
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeline</div>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                          <Bike className="h-3.5 w-3.5 text-blue-600" />
                          <span className="font-semibold">Assigned:</span>
                          <span className="text-muted-foreground">{fmt(x.assigned_at)}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-purple-600" />
                          <span className="font-semibold">Picked up:</span>
                          <span className="text-muted-foreground">{fmt(x.picked_up_at)}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-semibold">Delivered:</span>
                          <span className="text-muted-foreground">{fmt(x.delivered_at)}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-semibold">Order placed:</span>
                          <span className="text-muted-foreground">{fmt(x.order?.created_at)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {x.proof_photo && (
                    <div className="mt-3">
                      <DeliveryProofPhoto url={x.proof_photo} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
