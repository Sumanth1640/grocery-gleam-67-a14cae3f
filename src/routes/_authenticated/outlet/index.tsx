import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { toast } from "sonner";
import { Loader2, MapPin, ShoppingBag, UtensilsCrossed, Power } from "lucide-react";
import { myManagedOutlets, listOutletOrders, toggleOutletOpen } from "@/lib/outlet-managers.functions";

export const Route = createFileRoute("/_authenticated/outlet/")({
  component: OutletIndex,
});

function OutletIndex() {
  const qc = useQueryClient();
  const outletsFn = useDualFn(myManagedOutlets, (d) => php.outletMgr.myManagedOutlets(d));
  const ordersFn = useDualFn(listOutletOrders, (d) => php.outletMgr.listOutletOrders(d));
  const toggleFn = useDualFn(toggleOutletOpen, (d) => php.outletMgr.toggleOutletOpen(d));
  const o = useQuery({ queryKey: ["my-managed-outlets"], queryFn: () => outletsFn() });
  const ord = useQuery({ queryKey: ["outlet-orders", "all"], queryFn: () => ordersFn({ data: {} }), refetchInterval: 15_000 });

  const toggle = useMutation({
    mutationFn: (v: { outlet_id: string; is_open: boolean }) => toggleFn({ data: v }),
    onSuccess: (_d, v) => {
      toast.success(v.is_open ? "Outlet is now accepting orders" : "Outlet paused");
      qc.invalidateQueries({ queryKey: ["my-managed-outlets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (o.isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const outlets = o.data ?? [];
  const orders = (ord.data ?? []) as Array<{ id: string; status: string; total: number; outlet_id: string }>;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todays = orders.filter((x) => new Date((x as unknown as { created_at: string }).created_at).getTime() >= today.getTime());
  const newCount = orders.filter((x) => x.status === "placed").length;
  const revenue = todays.reduce((s, x) => s + x.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="New orders" value={newCount} tint="bg-primary/10 text-primary" />
        <Stat label="Today's orders" value={todays.length} tint="bg-blue-500/10 text-blue-600" />
        <Stat label="Today's revenue" value={`₹${revenue}`} tint="bg-success/10 text-success" />
      </div>

      <div>
        <div className="mb-2 font-display text-lg font-bold">Your outlets</div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {outlets.map((m) => {
            const isOpen = m.outlet?.is_open ?? true;
            return (
              <li key={m.id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold truncate">{m.outlet?.name}</div>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase ${isOpen ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {isOpen ? "Open" : "Paused"}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{m.restaurant_name} · {m.outlet?.area} {m.outlet?.pincode}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.role}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/outlet/orders" search={{ outlet: m.outlet_id } as never} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                    <ShoppingBag className="h-3.5 w-3.5" /> Orders
                  </Link>
                  <Link to="/outlet/menu" search={{ outlet: m.outlet_id } as never} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold">
                    <UtensilsCrossed className="h-3.5 w-3.5" /> Menu
                  </Link>
                  <button
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ outlet_id: m.outlet_id, is_open: !isOpen })}
                    className={`ml-auto inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${isOpen ? "border-destructive/40 text-destructive hover:bg-destructive/5" : "border-success/40 text-success hover:bg-success/5"}`}
                  >
                    <Power className="h-3.5 w-3.5" /> {isOpen ? "Pause outlet" : "Resume"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string | number; tint: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className={`mt-1 inline-flex rounded-lg px-2 py-1 font-display text-2xl font-extrabold ${tint}`}>{value}</div>
    </div>
  );
}
