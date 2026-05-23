import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, UserCog, MapPin } from "lucide-react";
import { listMyOutlets } from "@/lib/outlets.functions";
import { listOutletManagers, addOutletManager, removeOutletManager } from "@/lib/outlet-managers.functions";

export const Route = createFileRoute("/_authenticated/partner/managers")({
  component: ManagersPage,
});

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus";

function ManagersPage() {
  const listOutletsFn = useServerFn(listMyOutlets);
  const q = useQuery({ queryKey: ["partner", "outlets"], queryFn: () => listOutletsFn() });

  if (q.isLoading) return <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const { restaurants = [], outlets = [] } = (q.data ?? {}) as {
    restaurants: { id: string; name: string }[];
    outlets: { id?: string; name: string; restaurant_id: string }[];
  };

  if (!restaurants.length) {
    return <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Complete your restaurant profile first.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Outlet managers</h1>
        <p className="text-sm text-muted-foreground">Assign a manager/cashier account to each outlet. They will see only that outlet's orders in their dedicated panel.</p>
      </div>

      {restaurants.map((r) => {
        const mine = outlets.filter((o) => o.restaurant_id === r.id && o.id);
        if (!mine.length) {
          return (
            <div key={r.id} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="font-display font-bold">{r.name}</div>
              <div className="mt-2 text-xs text-muted-foreground">Add outlets first to assign managers.</div>
            </div>
          );
        }
        return <RestaurantBlock key={r.id} restaurantId={r.id} restaurantName={r.name} />;
      })}
    </div>
  );
}

function RestaurantBlock({ restaurantId, restaurantName }: { restaurantId: string; restaurantName: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listOutletManagers);
  const addFn = useServerFn(addOutletManager);
  const delFn = useServerFn(removeOutletManager);

  const q = useQuery({
    queryKey: ["outlet-managers", restaurantId],
    queryFn: () => listFn({ data: { restaurant_id: restaurantId } }),
  });

  const [openOutlet, setOpenOutlet] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"manager" | "cashier">("manager");

  const addMut = useMutation({
    mutationFn: (v: { outlet_id: string; email: string; role: "manager" | "cashier" }) => addFn({ data: v }),
    onSuccess: () => {
      toast.success("Manager added");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["outlet-managers", restaurantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["outlet-managers", restaurantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-4 shadow-card">
        <div className="font-display font-bold">{restaurantName}</div>
        <Loader2 className="mt-2 h-4 w-4 animate-spin" />
      </div>
    );
  }

  const outlets = q.data?.outlets ?? [];
  const managers = q.data?.managers ?? [];

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="mb-3 font-display text-base font-bold">{restaurantName}</div>
      <div className="space-y-3">
        {outlets.map((o) => {
          const mgrs = managers.filter((m) => m.outlet_id === o.id);
          const isOpen = openOutlet === o.id;
          return (
            <div key={o.id} className="rounded-xl border">
              <div className="flex items-center gap-3 p-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{o.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{o.area} · {o.pincode} · {mgrs.length} manager{mgrs.length === 1 ? "" : "s"}</div>
                </div>
                <button onClick={() => setOpenOutlet(isOpen ? null : o.id)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold">
                  <UserCog className="h-3.5 w-3.5" /> Manage
                </button>
              </div>
              {isOpen && (
                <div className="border-t p-3">
                  {mgrs.length > 0 && (
                    <ul className="mb-3 divide-y rounded-lg border">
                      {mgrs.map((m) => (
                        <li key={m.id} className="flex items-center gap-2 p-2 text-sm">
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold">{m.full_name || m.email || m.user_id.slice(0, 8)}</div>
                            <div className="truncate text-xs text-muted-foreground">{m.email} · {m.role}</div>
                          </div>
                          <button
                            onClick={() => confirm("Remove this manager?") && delMut.mutate(m.id)}
                            className="rounded-md border px-2 py-1 text-xs text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                    <input
                      className={inputCls}
                      type="email"
                      placeholder="manager@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as "manager" | "cashier")}>
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                    </select>
                    <button
                      disabled={!email || addMut.isPending}
                      onClick={() => addMut.mutate({ outlet_id: o.id, email, role })}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">The user must have an account already. They'll log in and find the Outlet panel.</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
