import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminLowStock, adminReorderStock } from "@/lib/admin-extra.functions";
import { Loader2, PackagePlus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Admin" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const listFn = useServerFn(adminLowStock);
  const reFn = useServerFn(adminReorderStock);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-low-stock"], queryFn: () => listFn() });
  const reorderM = useMutation({
    mutationFn: (v: { warehouse_id: string; product_id: string; add_qty: number }) => reFn({ data: v }),
    onSuccess: (res: any) => { toast.success(`Restocked → ${res.qty}`); qc.invalidateQueries({ queryKey: ["admin-low-stock"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold">Low-stock alerts</h2>
        <p className="text-sm text-muted-foreground">Products at or below their reorder threshold across all warehouses.</p>
      </div>
      {q.isLoading ? <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b"><th className="p-3">Product</th><th>Warehouse</th><th>Qty</th><th>Threshold</th><th className="text-right pr-3">Reorder</th></tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((s: any) => (
                <Row key={s.id} s={s} onReorder={(qty) => reorderM.mutate({ warehouse_id: s.warehouse_id, product_id: s.product_id, add_qty: qty })} />
              ))}
              {(q.data ?? []).length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">All stocked up — no low-stock items.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ s, onReorder }: { s: any; onReorder: (qty: number) => void }) {
  const [qty, setQty] = useState(50);
  return (
    <tr className="border-b last:border-0">
      <td className="p-3">
        <div className="flex items-center gap-2">
          {s.product?.image && <img src={s.product.image} alt="" className="h-9 w-9 rounded-lg object-cover" />}
          <div>
            <div className="font-semibold">{s.product?.name ?? "—"}</div>
            <div className="text-xs text-muted-foreground">{s.product?.slug ?? s.product_id.slice(0, 8)}</div>
          </div>
        </div>
      </td>
      <td>{s.warehouse?.name ?? s.warehouse_id.slice(0, 8)}</td>
      <td>
        <span className={`inline-flex items-center gap-1 font-bold ${s.qty === 0 ? "text-destructive" : "text-warning"}`}>
          {s.qty === 0 && <AlertTriangle className="h-3.5 w-3.5" />}
          {s.qty}
        </span>
      </td>
      <td className="text-muted-foreground">{s.low_stock_threshold}</td>
      <td className="pr-3 text-right">
        <div className="inline-flex items-center gap-1">
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-20 rounded-lg border bg-background px-2 py-1 text-sm" />
          <button onClick={() => onReorder(qty)} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-pop">
            <PackagePlus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </td>
    </tr>
  );
}
