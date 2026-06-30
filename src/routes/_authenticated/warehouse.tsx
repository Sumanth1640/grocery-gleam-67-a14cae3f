import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { php } from "@/lib/php-api";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Clock, Search, Bike, UserCheck, X, Warehouse, ArrowLeft } from "lucide-react";
import { DeliveryProofPhoto } from "@/components/DeliveryProofPhoto";

export const Route = createFileRoute("/_authenticated/warehouse")({
  head: () => ({ meta: [{ title: "Warehouse panel — hallifresh" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { phpAuth } = await import("@/lib/php-api");
    if (!phpAuth.get()) throw redirect({ to: "/login", search: { redirect: location.href } });
    throw redirect({ to: "/admin/rider-assignment", replace: true });
  },
  component: WarehousePage,
});

function WarehousePage() {
  return <WarehousePanelBody />;
}

const STATUSES = ["placed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];
const STATUS_LABEL: Record<Status, string> = {
  placed: "New", preparing: "Packing", ready: "Ready",
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

export function WarehousePanelBody({ embedded = false }: { embedded?: boolean }) {
  const wh = useQuery({ queryKey: ["wh-mgr-warehouses"], queryFn: () => php.warehouseMgr.myWarehouses() });
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const warehouses = (wh.data ?? []) as Array<{ id: string; name: string; code: string; city?: string }>;

  const ord = useQuery({
    queryKey: ["wh-mgr-orders", selected ?? "all"],
    queryFn: () => php.warehouseMgr.listOrders({ warehouse_id: selected }),
    enabled: warehouses.length > 0,
    refetchInterval: 15_000,
  });

  const [filter, setFilter] = useState<"all" | Status>("all");
  const [q, setQ] = useState("");

  const orders = (ord.data ?? []) as Array<{
    id: string; status: string; total: number; warehouse_id: string;
    items: any[]; address: any; created_at: string; payment: string;
  }>;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((x) => {
      if (filter !== "all" && (x.status as Status) !== filter) return false;
      if (!s) return true;
      return x.id.toLowerCase().includes(s)
        || (x.address?.full_name ?? "").toLowerCase().includes(s)
        || (x.address?.phone ?? "").toLowerCase().includes(s);
    });
  }, [orders, filter, q]);

  if (wh.isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  if (!warehouses.length) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
          <Warehouse className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-xl font-bold">No warehouses assigned</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask an admin to add you as a manager for a warehouse.</p>
          <Link to="/" className="mt-5 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-muted/30"}>
      {!embedded && (
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
            <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
            <div className="ml-2 flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Warehouse className="h-3.5 w-3.5" /></div>
              <div className="font-display text-sm font-bold leading-none">
                Warehouse panel
                <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  {warehouses.length === 1 ? warehouses[0].name : `${warehouses.length} warehouses`}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={embedded ? "" : "mx-auto max-w-6xl px-4 py-6"}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold">Orders & rider assignment</h1>
          <div className="flex items-center gap-3">
            <Link to={embedded ? "/admin/assignment-history" : "/warehouse/history"} className="rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary">
              Assignment history
            </Link>
            <div className="hidden text-xs text-muted-foreground sm:block">Auto-refreshes every 15s</div>
          </div>
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

        {ord.isLoading ? (
          <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
            {orders.length === 0 ? "No orders yet for your warehouse(s)." : "No orders match your filters."}
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
                        {items.map((it: any, i: number) => {
                          const name = it?.product?.name ?? it?.name ?? "Item";
                          const qty = Number(it?.qty ?? 1);
                          const price = Number(it?.product?.price ?? it?.price ?? 0);
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
                        <div className="mt-1 text-xs">{x.address?.line1}, {x.address?.city} {x.address?.pincode ?? ""}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                    <AssignRiderButton
                      orderId={x.id}
                      warehouseId={x.warehouse_id}
                      deliveryPincode={x.address?.pincode}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function AssignRiderButton({ orderId, warehouseId, deliveryPincode }: { orderId: string; warehouseId: string; deliveryPincode?: string }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const current = useQuery({
    queryKey: ["wh-mgr-assignment", orderId],
    queryFn: () => php.warehouseMgr.getOrderAssignment({ order_id: orderId }),
    refetchInterval: 20_000,
  });
  const riders = useQuery({
    queryKey: ["wh-mgr-available-riders", warehouseId, deliveryPincode ?? ""],
    queryFn: () =>
      php.warehouseMgr.availableRiders({
        warehouse_id: warehouseId,
        delivery_pincode: deliveryPincode && /^\d{4,8}$/.test(deliveryPincode) ? deliveryPincode : undefined,
      }),
    enabled: open,
  });
  const assign = useMutation({
    mutationFn: (rider_id: string) => php.warehouseMgr.assignOrder({ order_id: orderId, rider_id }),
    onSuccess: () => {
      toast.success("Rider assigned");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["wh-mgr-assignment", orderId] });
      qc.invalidateQueries({ queryKey: ["wh-mgr-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const a = current.data as any;
  const assigned = a?.riders;
  const label = assigned ? `${assigned.name}` : "Assign rider";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${assigned ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "hover:bg-secondary"}`}
      >
        {assigned ? <UserCheck className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">{assigned ? "Change rider" : "Assign rider"}</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Approved riders covering this warehouse's pincodes, sorted by current load.
              Riders matching the delivery pincode appear first.
            </p>
            {assigned && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs">
                Currently with <b>{assigned.name}</b> · {assigned.phone} ({a.status})
              </div>
            )}
            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {riders.isLoading && <div className="grid place-items-center py-8"><Loader2 className="h-4 w-4 animate-spin" /></div>}
              {!riders.isLoading && (riders.data ?? []).length === 0 && (
                <div className="rounded-xl border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                  No approved riders available right now.
                </div>
              )}
              {(riders.data ?? []).map((r: any) => (
                <button
                  key={r.id}
                  disabled={assign.isPending}
                  onClick={() => assign.mutate(r.id)}
                  className="flex w-full items-center justify-between rounded-xl border bg-card p-3 text-left text-sm hover:bg-secondary disabled:opacity-50"
                >
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.phone} · {r.vehicle} {r.vehicle_no}</div>
                  </div>
                  <div className="text-right text-[10px]">
                    {r.pincode_match && <div className="font-bold uppercase text-emerald-600">Pin match</div>}
                    <div className="text-muted-foreground">{r.active_orders} active</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
