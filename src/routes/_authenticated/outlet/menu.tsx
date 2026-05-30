import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { myManagedOutlets, listOutletDishes, toggleOutletDishStock } from "@/lib/outlet-managers.functions";

const searchSchema = z.object({ outlet: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/outlet/menu")({
  validateSearch: (s) => searchSchema.parse(s),
  component: OutletMenuPage,
});

function OutletMenuPage() {
  const qc = useQueryClient();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const outletsFn = useDualFn(myManagedOutlets, (d) => php.outletMgr.myManagedOutlets(d));
  const dishesFn = useDualFn(listOutletDishes, (d) => php.outletMgr.listOutletDishes(d));
  const toggleFn = useDualFn(toggleOutletDishStock, (d) => php.outletMgr.toggleOutletDishStock(d));

  const o = useQuery({ queryKey: ["my-managed-outlets"], queryFn: () => outletsFn() });
  const outlets = o.data ?? [];
  const selected = search.outlet ?? outlets[0]?.outlet_id;

  const d = useQuery({
    queryKey: ["outlet-dishes", selected],
    queryFn: () => dishesFn({ data: { outlet_id: selected! } }),
    enabled: !!selected,
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; in_stock: boolean }) => toggleFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["outlet-dishes", selected] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (o.isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Menu availability</h1>
      <p className="mt-1 text-sm text-muted-foreground">Toggle dishes in/out of stock for your outlet.</p>

      {outlets.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {outlets.map((m) => (
            <button key={m.outlet_id} onClick={() => navigate({ search: { outlet: m.outlet_id } })}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase ${selected === m.outlet_id ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
              {m.outlet?.name}
            </button>
          ))}
        </div>
      )}

      {d.isLoading ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : !d.data?.length ? (
        <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
          No dishes are assigned to this outlet yet. Ask the owner to add dishes for this outlet from the partner menu.
        </div>
      ) : (
        <ul className="mt-6 divide-y rounded-2xl border bg-card shadow-card">
          {d.data.map((dish) => (
            <li key={dish.id} className="flex items-center gap-3 p-3">
              {dish.image ? <img src={dish.image} alt="" className="h-12 w-12 rounded-md object-cover" /> : <div className="h-12 w-12 rounded-md bg-muted" />}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{dish.name}</div>
                <div className="text-xs text-muted-foreground">{dish.section} · ₹{dish.price}</div>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={dish.in_stock} onChange={(e) => toggle.mutate({ id: dish.id, in_stock: e.target.checked })} />
                {dish.in_stock ? "In stock" : "Out of stock"}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
