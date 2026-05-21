import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, MapPin, Package, Users, X } from "lucide-react";
import {
  listWarehouses, saveWarehouse, deleteWarehouse,
  listWarehousePincodes, setWarehousePincodes,
  listWarehouseStock, setProductStock,
} from "@/lib/warehouses.functions";
import { listWarehouseManagers, addWarehouseManager, removeWarehouseManager } from "@/lib/warehouse-managers.functions";

export const Route = createFileRoute("/_authenticated/admin/warehouses")({
  component: WarehousesAdmin,
});

type Warehouse = {
  id: string; name: string; code: string; address: string; city: string; pincode: string;
  lat: number | null; lng: number | null; is_active: boolean; sort_order: number;
};

const blank: Omit<Warehouse, "id"> = {
  name: "", code: "", address: "", city: "", pincode: "",
  lat: null, lng: null, is_active: true, sort_order: 0,
};

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus";

function WarehousesAdmin() {
  const qc = useQueryClient();
  const list = useServerFn(listWarehouses);
  const save = useServerFn(saveWarehouse);
  const del = useServerFn(deleteWarehouse);

  const q = useQuery({ queryKey: ["admin", "warehouses"], queryFn: () => list() });
  const [editing, setEditing] = useState<Partial<Warehouse> | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin", "warehouses"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "warehouses"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const rows = (q.data ?? []) as Warehouse[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Warehouses</h1>
        <button onClick={() => setEditing({ ...blank })} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> New warehouse
        </button>
      </div>

      {editing && (
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><input className={inputCls} value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Code (unique)"><input className={inputCls} value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="WH-MUM-1" /></Field>
            <Field label="Address" className="sm:col-span-2"><input className={inputCls} value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <Field label="City"><input className={inputCls} value={editing.city ?? ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
            <Field label="Pincode"><input className={inputCls} value={editing.pincode ?? ""} onChange={(e) => setEditing({ ...editing, pincode: e.target.value })} /></Field>
            <Field label="Latitude"><input className={inputCls} type="number" step="any" value={editing.lat ?? ""} onChange={(e) => setEditing({ ...editing, lat: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
            <Field label="Longitude"><input className={inputCls} type="number" step="any" value={editing.lng ?? ""} onChange={(e) => setEditing({ ...editing, lng: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
            <Field label="Sort order"><input className={inputCls} type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              <Save className="h-4 w-4" /> Save
            </button>
            <button onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No warehouses yet.</div>
      ) : (
        <div className="space-y-2">
          {rows.map((w) => (
            <div key={w.id} className="rounded-2xl border bg-card shadow-card">
              <div className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold">{w.name}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{w.code}</span>
                    {!w.is_active && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">Inactive</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{w.address}{w.address && ", "}{w.city} {w.pincode}</div>
                </div>
                <button onClick={() => setExpanded(expanded === w.id ? null : w.id)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">{expanded === w.id ? "Hide" : "Manage"}</button>
                <button onClick={() => setEditing(w)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Edit</button>
                <button onClick={() => confirm(`Delete ${w.name}?`) && delMut.mutate(w.id)} className="rounded-lg border px-2 py-1.5 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              {expanded === w.id && (
                <div className="grid gap-4 border-t bg-secondary/20 p-4 md:grid-cols-2">
                  <PincodesPanel warehouseId={w.id} />
                  <StockPanel warehouseId={w.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PincodesPanel({ warehouseId }: { warehouseId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listWarehousePincodes);
  const saveFn = useServerFn(setWarehousePincodes);
  const q = useQuery({ queryKey: ["admin", "wh-pincodes", warehouseId], queryFn: () => listFn({ data: { warehouse_id: warehouseId } }) });
  const [text, setText] = useState("");
  const initial = ((q.data ?? []) as { pincode: string }[]).map((r) => r.pincode).join(", ");
  const value = text || initial;

  const mut = useMutation({
    mutationFn: () => saveFn({ data: { warehouse_id: warehouseId, pincodes: value.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean) } }),
    onSuccess: () => { toast.success("Pincodes updated"); qc.invalidateQueries({ queryKey: ["admin", "wh-pincodes", warehouseId] }); setText(""); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4" /> Serviceable pincodes</div>
      <textarea
        className="mt-2 h-24 w-full rounded-lg border bg-background p-2 text-xs"
        placeholder="400001, 400002, 400003"
        value={value}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => mut.mutate()} disabled={mut.isPending} className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">Save pincodes</button>
    </div>
  );
}

function StockPanel({ warehouseId }: { warehouseId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listWarehouseStock);
  const setFn = useServerFn(setProductStock);
  const q = useQuery({ queryKey: ["admin", "wh-stock", warehouseId], queryFn: () => listFn({ data: { warehouse_id: warehouseId } }) });

  const mut = useMutation({
    mutationFn: (v: { product_id: string; qty: number }) => setFn({ data: { warehouse_id: warehouseId, ...v, low_stock_threshold: 5 } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "wh-stock", warehouseId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (q.data ?? []) as Array<{ product: { id: string; name: string; image: string }; qty: number }>;

  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2 text-sm font-bold"><Package className="h-4 w-4" /> Stock</div>
      <div className="mt-2 max-h-72 space-y-1 overflow-auto">
        {rows.map((r) => (
          <div key={r.product.id} className="flex items-center gap-2 rounded-lg border p-2">
            {r.product.image && <img src={r.product.image} alt="" className="h-8 w-8 rounded object-cover" />}
            <div className="flex-1 truncate text-xs font-semibold">{r.product.name}</div>
            <input
              type="number" min={0}
              defaultValue={r.qty}
              onBlur={(e) => { const v = Number(e.target.value); if (v !== r.qty) mut.mutate({ product_id: r.product.id, qty: v }); }}
              className="w-20 rounded-md border bg-background px-2 py-1 text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>{children}</label>;
}
