import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, MapPin } from "lucide-react";
import { listMyOutlets, saveOutlet, deleteOutlet } from "@/lib/outlets.functions";

export const Route = createFileRoute("/_authenticated/partner/outlets")({
  component: OutletsPage,
});

type Outlet = {
  id?: string; restaurant_id: string; name: string; address: string; area: string; pincode: string;
  lat: number | null; lng: number | null; eta_mins: number; is_open: boolean; is_active: boolean; sort_order: number;
};

const blank = (restaurant_id: string): Outlet => ({
  restaurant_id, name: "", address: "", area: "", pincode: "",
  lat: null, lng: null, eta_mins: 30, is_open: true, is_active: true, sort_order: 0,
});

const inputCls = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus";

function OutletsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyOutlets);
  const saveFn = useServerFn(saveOutlet);
  const delFn = useServerFn(deleteOutlet);
  const q = useQuery({ queryKey: ["partner", "outlets"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<Outlet | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: Outlet) => saveFn({ data: v as any }),
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["partner", "outlets"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["partner", "outlets"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const { restaurants = [], outlets = [] } = (q.data ?? {}) as { restaurants: { id: string; name: string }[]; outlets: Outlet[] };

  if (!restaurants.length) {
    return <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Complete your restaurant profile first.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Outlets</h1>
      <p className="text-sm text-muted-foreground">Add multiple branches for each of your restaurants. Customers are routed to the nearest open outlet.</p>

      {editing && (
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Restaurant">
              <select className={inputCls} value={editing.restaurant_id} onChange={(e) => setEditing({ ...editing, restaurant_id: e.target.value })}>
                {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Outlet name"><input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Andheri West" /></Field>
            <Field label="Address" className="sm:col-span-2"><input className={inputCls} value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <Field label="Area"><input className={inputCls} value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })} /></Field>
            <Field label="Pincode"><input className={inputCls} value={editing.pincode} onChange={(e) => setEditing({ ...editing, pincode: e.target.value })} /></Field>
            <Field label="Latitude"><input className={inputCls} type="number" step="any" value={editing.lat ?? ""} onChange={(e) => setEditing({ ...editing, lat: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
            <Field label="Longitude"><input className={inputCls} type="number" step="any" value={editing.lng ?? ""} onChange={(e) => setEditing({ ...editing, lng: e.target.value === "" ? null : Number(e.target.value) })} /></Field>
            <Field label="ETA (mins)"><input className={inputCls} type="number" value={editing.eta_mins} onChange={(e) => setEditing({ ...editing, eta_mins: Number(e.target.value) })} /></Field>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_open} onChange={(e) => setEditing({ ...editing, is_open: e.target.checked })} /> Open now</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => saveMut.mutate(editing)} disabled={saveMut.isPending} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">
              <Save className="h-4 w-4" /> Save outlet
            </button>
            <button onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {restaurants.map((r) => {
        const mine = outlets.filter((o) => o.restaurant_id === r.id);
        return (
          <div key={r.id} className="rounded-2xl border bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-base font-bold">{r.name}</div>
              <button onClick={() => setEditing(blank(r.id))} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> Add outlet
              </button>
            </div>
            {mine.length === 0 ? (
              <div className="text-xs text-muted-foreground">No outlets yet — orders fall back to the restaurant defaults.</div>
            ) : (
              <ul className="divide-y rounded-xl border">
                {mine.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 p-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{o.name} <span className="text-xs text-muted-foreground">· {o.eta_mins} min</span></div>
                      <div className="truncate text-xs text-muted-foreground">{o.address || o.area} · {o.pincode}</div>
                    </div>
                    {!o.is_open && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Closed</span>}
                    {!o.is_active && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">Inactive</span>}
                    <button onClick={() => setEditing(o)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold">Edit</button>
                    <button onClick={() => o.id && confirm(`Delete ${o.name}?`) && delMut.mutate(o.id)} className="rounded-lg border px-2 py-1.5 text-xs font-semibold text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>{children}</label>;
}
