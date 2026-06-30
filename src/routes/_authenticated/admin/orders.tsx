import { createFileRoute, Link } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { Loader2, ChevronDown, ChevronRight, Search, Bike, UserCheck, X, History } from "lucide-react";
import { DeliveryProofPhoto } from "@/components/DeliveryProofPhoto";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["placed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];
type OrderItem = {
  product: { name: string; image?: string };
  qty: number;
};
type OrderAddress = {
  full_name?: string;
  phone?: string;
  pincode?: string;
  line1?: string;
  line2?: string;
  city?: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: Status;
  payment: string;
  subtotal: number;
  delivery: number;
  total: number;
  items: OrderItem[] | null;
  address: OrderAddress | null;
  created_at: string;
  warehouse_id?: string | null;
  warehouse?: { name: string; code: string } | null;
  restaurant_id?: string | null;
  restaurant?: { name: string } | null;
  outlet_id?: string | null;
  outlet?: { name: string; pincode?: string | null } | null;
};


const statusTint: Record<Status, string> = {
  placed: "bg-primary/10 text-primary",
  packed: "bg-brand/15 text-brand",
  out_for_delivery: "bg-warning/15 text-warning",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

function OrdersAdmin() {
  const list = useDualFn(adminListOrders, (d) => php.admin.listOrders(d));
  const update = useDualFn(adminUpdateOrderStatus, (d) => php.admin.updateOrderStatus(d));
  const qc = useQueryClient();
  const { session, user, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? user?.id ?? "unknown";
  const orders = useQuery({
    queryKey: ["admin", "orders", userId],
    queryFn: () => list(),
    enabled: !authLoading && !!session && !!user,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");

  const mut = useMutation({
    mutationFn: (v: { id: string; status: Status }) => update({ data: v }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
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
        <Link
          to="/admin/assignment-history"
          className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold hover:bg-secondary"
        >
          <History className="h-3.5 w-3.5" /> Assignment history
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === s
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:bg-accent"
            }`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {authLoading || orders.isLoading ? (
        <div className="grid h-32 place-items-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          No orders found.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((o) => {
            const items = o.items ?? [];
            const isOpen = open === o.id;
            const addr = o.address ?? {};
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl border bg-card shadow-card">
                <button
                  onClick={() => setOpen(isOpen ? null : o.id)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/30"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusTint[o.status]}`}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                      <span className="text-xs text-muted-foreground">
                        · {new Date(o.created_at).toLocaleString()}
                      </span>
                      {o.warehouse ? (
                        <span
                          className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground"
                          title={o.warehouse.name}
                        >
                          🏬 {o.warehouse.code}
                        </span>
                      ) : o.outlet ? (
                        <span
                          className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground"
                          title={`${o.restaurant?.name ?? ""} · ${o.outlet.name}${o.outlet.pincode ? " · " + o.outlet.pincode : ""}`}
                        >
                          🍽️ {o.outlet.name}{o.outlet.pincode ? ` · ${o.outlet.pincode}` : ""}
                        </span>
                      ) : o.restaurant ? (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-foreground">
                          🍽️ {o.restaurant.name}
                        </span>
                      ) : (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                          No warehouse
                        </span>
                      )}

                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-semibold">
                      {addr.full_name ?? "—"} · {items.length} item{items.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-extrabold">₹{o.total}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {o.payment}
                    </div>
                  </div>
                </button>

                <div className="flex flex-wrap items-center gap-2 border-t bg-background/50 px-4 py-2">
                  <AssignRiderButton
                    orderId={o.id}
                    warehouseId={o.warehouse_id ?? ""}
                    deliveryPincode={(o.address as { pincode?: string } | null)?.pincode}
                  />
                </div>


                {isOpen && (
                  <div className="space-y-4 border-t bg-secondary/20 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Delivering to
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {addr.full_name} · {addr.phone}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city} — {addr.pincode}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Fulfilled by
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {o.warehouse ? (
                            `${o.warehouse.name} (${o.warehouse.code})`
                          ) : o.outlet || o.restaurant ? (
                            <>
                              {o.restaurant?.name ?? "Restaurant"}
                              {o.outlet ? ` — ${o.outlet.name}` : ""}
                              {o.outlet?.pincode ? ` (${o.outlet.pincode})` : ""}
                            </>
                          ) : (
                            <span className="text-destructive">No warehouse assigned</span>
                          )}
                        </div>

                        <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Update status
                        </div>
                        <select
                          value={o.status}
                          onChange={(e) =>
                            mut.mutate({ id: o.id, status: e.target.value as Status })
                          }
                          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <ul className="divide-y rounded-xl border bg-background">
                      {items.map((it, i) => (
                        <li key={i} className="flex items-center gap-3 p-3 text-sm">
                          {it.product.image && (
                            <img
                              src={it.product.image}
                              alt=""
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
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

function AssignRiderButton({
  orderId,
  warehouseId,
  deliveryPincode,
}: {
  orderId: string;
  warehouseId: string;
  deliveryPincode?: string;
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const current = useQuery({
    queryKey: ["admin-assignment", orderId],
    queryFn: () => php.admin.currentAssignment({ order_id: orderId }),
    refetchInterval: 20_000,
  });
  const riders = useQuery({
    queryKey: ["admin-available-riders", warehouseId, deliveryPincode ?? ""],
    queryFn: () =>
      php.admin.availableRiders({
        warehouse_id: warehouseId || undefined,
        delivery_pincode:
          deliveryPincode && /^\d{4,8}$/.test(deliveryPincode) ? deliveryPincode : undefined,
      }),
    enabled: open,
  });
  const assign = useMutation({
    mutationFn: (rider_id: string) => php.admin.assignRider({ order_id: orderId, rider_id }),
    onSuccess: () => {
      toast.success("Rider assigned");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-assignment", orderId] });
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const a = current.data as { status?: string; proof_photo?: string | null; riders?: { name: string; phone: string } | null } | null;
  const assigned = a?.riders;
  const label = assigned ? `${assigned.name}${a?.status ? ` · ${a.status.replace(/_/g, " ")}` : ""}` : "Assign rider";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${
          assigned ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "hover:bg-secondary"
        }`}
      >
        {assigned ? <UserCheck className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">
                {assigned ? "Change rider" : "Assign rider"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Free, approved riders. Pincode-matched riders appear first.
            </p>
            {assigned && (
              <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs">
                Currently with <b>{assigned.name}</b> · {assigned.phone} ({a?.status})
              </div>
            )}
            {a?.proof_photo && (
              <div className="mt-3">
                <DeliveryProofPhoto url={a.proof_photo} />
              </div>
            )}
            <div className="mt-3 max-h-72 space-y-2 overflow-auto">
              {riders.isLoading && (
                <div className="grid place-items-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {!riders.isLoading && (riders.data ?? []).length === 0 && (
                <div className="rounded-xl border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                  No approved riders available right now.
                </div>
              )}
              {((riders.data as any[] | undefined) ?? []).map((r) => (
                <button
                  key={r.id}
                  disabled={assign.isPending}
                  onClick={() => assign.mutate(r.id)}
                  className="flex w-full items-center justify-between rounded-xl border bg-card p-3 text-left text-sm hover:bg-secondary disabled:opacity-50"
                >
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.phone} · {r.vehicle} {r.vehicle_no}
                    </div>
                  </div>
                  <div className="text-right text-[10px]">
                    {r.pincode_match && (
                      <div className="font-bold uppercase text-emerald-600">Pin match</div>
                    )}
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
