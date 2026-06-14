import { createFileRoute } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  adminListRiders, adminSaveRider, adminDeleteRider,
  adminAssignableOrders, adminAssignRider, adminUpdateAssignment,
} from "@/lib/admin-extra.functions";
import { adminListPendingRiders, adminDecideRider, adminListOutletsForRider, adminGetRiderAreas, adminSetRiderAreas } from "@/lib/rider.functions";
import { Loader2, Plus, Trash2, Bike, MapPin, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/riders")({
  head: () => ({ meta: [{ title: "Delivery riders — Admin" }] }),
  component: RidersPage,
});

const emptyRider = { name: "", phone: "", vehicle: "bike", vehicle_no: "", is_active: true, notes: "" };

function RidersPage() {
  const listFn = useDualFn(adminListRiders, (d) => php.admin.listRiders(d));
  const saveFn = useDualFn(adminSaveRider, (d) => php.admin.saveRider(d));
  const delFn = useDualFn(adminDeleteRider, (d) => php.admin.deleteRider(d));
  const assignableFn = useDualFn(adminAssignableOrders, (d) => php.admin.assignableOrders(d));
  const assignFn = useDualFn(adminAssignRider, (d) => php.admin.assignRider(d));
  const updateFn = useDualFn(adminUpdateAssignment, (d) => php.admin.updateAssignment(d));
  const qc = useQueryClient();

  const riders = useQuery({ queryKey: ["admin-riders"], queryFn: () => listFn() });
  const orders = useQuery({ queryKey: ["admin-assignable"], queryFn: () => assignableFn(), refetchInterval: 10_000 });
  const [editing, setEditing] = useState<any | null>(null);
  const [areasFor, setAreasFor] = useState<any | null>(null);

  const saveM = useMutation({ mutationFn: (r: any) => saveFn({ data: r }), onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-riders"] }); }, onError: (e: Error) => toast.error(e.message) });
  const delM = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-riders"] }); }, onError: (e: Error) => toast.error(e.message) });
  const assignM = useMutation({ mutationFn: (v: { order_id: string; rider_id: string }) => assignFn({ data: v }), onSuccess: () => { toast.success("Assigned"); qc.invalidateQueries({ queryKey: ["admin-assignable"] }); qc.invalidateQueries({ queryKey: ["admin-riders"] }); }, onError: (e: Error) => toast.error(e.message) });
  const updateM = useMutation({ mutationFn: (v: any) => updateFn({ data: v }), onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-assignable"] }); qc.invalidateQueries({ queryKey: ["admin-riders"] }); }, onError: (e: Error) => toast.error(e.message) });

  const pending = useQuery({ queryKey: ["admin-pending-riders"], queryFn: () => adminListPendingRiders(), refetchInterval: 30_000 });
  const decideM = useMutation({
    mutationFn: (v: { rider_id: string; approve: boolean; reason?: string }) => adminDecideRider({ data: { ...v, reason: v.reason ?? "" } }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-pending-riders"] }); qc.invalidateQueries({ queryKey: ["admin-riders"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {(pending.data ?? []).length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold">Pending rider applications ({(pending.data ?? []).length})</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {(pending.data ?? []).map((r: any) => (
              <div key={r.id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-amber-600" />
                      <span className="font-semibold">{r.name}</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Pending</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{r.phone} · {r.vehicle} {r.vehicle_no}</div>
                    {r.notes && <div className="mt-1 text-xs italic text-muted-foreground">"{r.notes}"</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => decideM.mutate({ rider_id: r.id, approve: true })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" /> Approve</button>
                    <button onClick={() => { const reason = prompt("Reason for rejection?") ?? ""; decideM.mutate({ rider_id: r.id, approve: false, reason }); }} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-bold text-destructive"><X className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Delivery riders</h2>
          <button onClick={() => setEditing({ ...emptyRider })} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop"><Plus className="h-3.5 w-3.5" /> Add rider</button>
        </div>
        {riders.isLoading ? <Loader2 className="mt-6 h-6 w-6 animate-spin text-muted-foreground" /> : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {(riders.data ?? []).map((r: any) => (
              <div key={r.id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bike className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{r.name}</span>
                      {!r.is_active && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">Inactive</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{r.phone} · {r.vehicle} {r.vehicle_no}</div>
                    <div className="mt-1 text-xs">Active orders: <span className="font-bold">{r.active_orders}</span></div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(r)} className="rounded-lg border px-2 py-1 text-xs hover:bg-secondary">Edit</button>
                    <button onClick={() => setAreasFor(r)} className="rounded-lg border px-2 py-1 text-xs hover:bg-secondary"><MapPin className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { if (confirm("Delete rider?")) delM.mutate(r.id); }} className="rounded-lg border border-destructive/30 px-2 py-1 text-xs text-destructive hover:bg-destructive/5"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
            {(riders.data ?? []).length === 0 && <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground md:col-span-2">No riders yet.</div>}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Live deliveries</h2>
        <p className="text-sm text-muted-foreground">Assign riders and track their status.</p>
        {orders.isLoading ? <Loader2 className="mt-6 h-6 w-6 animate-spin text-muted-foreground" /> : (
          <div className="mt-3 overflow-x-auto rounded-2xl border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b"><th className="p-3">Order</th><th>Status</th><th>Rider</th><th>Delivery status</th><th className="text-right pr-3">Actions</th></tr>
              </thead>
              <tbody>
                {(orders.data ?? []).map((o: any) => {
                  const addr = o.address as any;
                  return (
                    <tr key={o.id} className="border-b last:border-0 align-top">
                      <td className="p-3">
                        <div className="font-semibold">#{o.id.slice(0, 8)} · ₹{o.total}</div>
                        <div className="text-xs text-muted-foreground"><MapPin className="inline h-3 w-3" /> {addr?.city ?? ""} {addr?.pincode ?? ""}</div>
                      </td>
                      <td><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary">{o.status}</span></td>
                      <td>{o.assignment?.riders?.name ?? <span className="text-xs text-muted-foreground">—</span>}</td>
                      <td>{o.assignment ? <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase">{o.assignment.status}</span> : <span className="text-xs text-muted-foreground">unassigned</span>}</td>
                      <td className="pr-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <select
                            onChange={(e) => { if (e.target.value) assignM.mutate({ order_id: o.id, rider_id: e.target.value }); e.currentTarget.value = ""; }}
                            className="rounded-lg border bg-background px-2 py-1 text-xs" defaultValue="">
                            <option value="">{o.assignment ? "Reassign…" : "Assign rider…"}</option>
                            {(riders.data ?? []).filter((r: any) => r.is_active).map((r: any) => <option key={r.id} value={r.id}>{r.name} ({r.active_orders})</option>)}
                          </select>
                          {o.assignment && o.assignment.status !== "delivered" && o.assignment.status !== "cancelled" && (
                            <>
                              {o.assignment.status === "assigned" && <button onClick={() => updateM.mutate({ order_id: o.id, status: "picked_up" })} className="rounded-lg border px-2 py-1 text-xs hover:bg-secondary">Pickup</button>}
                              {o.assignment.status === "picked_up" && <button onClick={() => updateM.mutate({ order_id: o.id, status: "delivered" })} className="rounded-lg bg-success px-2 py-1 text-xs font-bold text-success-foreground">Delivered</button>}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(orders.data ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No active orders.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} rider</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveM.mutate(editing); }} className="mt-4 space-y-3">
              <Input label="Name" v={editing.name} on={(v) => setEditing({ ...editing, name: v })} required />
              <Input label="Phone" v={editing.phone} on={(v) => setEditing({ ...editing, phone: v })} required />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Vehicle" v={editing.vehicle} on={(v) => setEditing({ ...editing, vehicle: v })} />
                <Input label="Vehicle no." v={editing.vehicle_no} on={(v) => setEditing({ ...editing, vehicle_no: v })} />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
              <Input label="Notes" v={editing.notes} on={(v) => setEditing({ ...editing, notes: v })} />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
                <button type="submit" disabled={saveM.isPending} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">{saveM.isPending ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {areasFor && <AreasDialog rider={areasFor} onClose={() => setAreasFor(null)} />}
    </div>
  );
}

function AreasDialog({ rider, onClose }: { rider: any; onClose: () => void }) {
  const qc = useQueryClient();
  const outlets = useQuery({ queryKey: ["admin-outlets-for-rider"], queryFn: () => adminListOutletsForRider() });
  const current = useQuery({ queryKey: ["admin-rider-areas", rider.id], queryFn: () => adminGetRiderAreas({ data: { rider_id: rider.id } }) });
  const [selOutlets, setSelOutlets] = useState<Set<string>>(new Set());
  const [pincodes, setPincodes] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  if (current.data && !loaded) {
    setSelOutlets(new Set(current.data.outlet_ids));
    setPincodes(current.data.pincodes.join(", "));
    setLoaded(true);
  }
  const saveM = useMutation({
    mutationFn: () => adminSetRiderAreas({ data: {
      rider_id: rider.id,
      outlet_ids: Array.from(selOutlets),
      pincodes: pincodes.split(/[,\s]+/).map((s) => s.trim()).filter((s) => /^\d{6}$/.test(s)),
    } }),
    onSuccess: () => { toast.success("Areas saved"); qc.invalidateQueries({ queryKey: ["admin-rider-areas", rider.id] }); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = (id: string) => {
    const n = new Set(selOutlets);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelOutlets(n);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold">Coverage for {rider.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Outlet managers only see riders linked to their outlet. Pincodes are used for product/warehouse deliveries.</p>
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Outlets ({selOutlets.size})</div>
          <div className="mt-2 max-h-56 space-y-1 overflow-auto rounded-xl border p-2">
            {outlets.isLoading && <Loader2 className="m-4 h-4 w-4 animate-spin" />}
            {(outlets.data ?? []).map((o: any) => (
              <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-secondary">
                <input type="checkbox" checked={selOutlets.has(o.id)} onChange={() => toggle(o.id)} />
                <span className="flex-1">{o.name} <span className="text-xs text-muted-foreground">· {o.partner_restaurants?.name} · {o.area} {o.pincode}</span></span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pincodes (comma-separated, 6-digit)</div>
          <textarea value={pincodes} onChange={(e) => setPincodes(e.target.value)} rows={2}
            placeholder="560001, 560002" className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
          <button disabled={saveM.isPending} onClick={() => saveM.mutate()} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">{saveM.isPending ? "Saving…" : "Save coverage"}</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, v, on, required }: { label: string; v: string; on: (s: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <input value={v} onChange={(e) => on(e.target.value)} required={required} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
    </label>
  );
}
