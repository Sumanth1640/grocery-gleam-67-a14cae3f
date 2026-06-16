import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Wallet, Bike, BadgeCheck, History, Settings2 } from "lucide-react";
import { adminListPendingEarnings, adminListPayouts, adminPayRider, adminGetRiderFee, adminSetRiderFee } from "@/lib/earnings.functions";

export const Route = createFileRoute("/_authenticated/admin/payouts")({
  head: () => ({ meta: [{ title: "Rider payouts — Admin" }] }),
  component: PayoutsPage,
});

function PayoutsPage() {
  const qc = useQueryClient();
  const pending = useQuery({ queryKey: ["admin-pending-earnings"], queryFn: () => adminListPendingEarnings(), refetchInterval: 30_000 });
  const history = useQuery({ queryKey: ["admin-payouts"], queryFn: () => adminListPayouts() });
  const feeQ = useQuery({ queryKey: ["admin-rider-fee"], queryFn: () => adminGetRiderFee() });

  const payM = useMutation({
    mutationFn: (v: { rider_id: string; notes?: string }) => adminPayRider({ data: { rider_id: v.rider_id, notes: v.notes ?? "" } }),
    onSuccess: (r: any) => {
      toast.success(`Paid ₹${r.amount.toFixed(2)} (${r.count} deliveries)`);
      qc.invalidateQueries({ queryKey: ["admin-pending-earnings"] });
      qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = (pending.data ?? []) as any[];
  const totalPending = groups.reduce((a, g) => a + g.total, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-primary">
              <Wallet className="h-4 w-4" /> Pending payouts
            </div>
            <div className="mt-1 font-display text-3xl font-black">₹{totalPending.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">{groups.length} rider(s) waiting · paid out at admin discretion</div>
          </div>
          <FeeEditor fee={feeQ.data?.fee ?? 40} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-rider-fee"] })} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Riders awaiting payout</h2>
        {pending.isLoading ? <Loader2 className="mt-6 h-6 w-6 animate-spin text-muted-foreground" /> : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {groups.length === 0 && <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground md:col-span-2">No pending payouts.</div>}
            {groups.map((g) => (
              <div key={g.rider_id} className="rounded-2xl border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><Bike className="h-4 w-4 text-primary" /><span className="font-semibold">{g.rider?.name ?? "Rider"}</span></div>
                    <div className="text-xs text-muted-foreground">{g.rider?.phone} · {g.rider?.vehicle} {g.rider?.vehicle_no}</div>
                    <div className="mt-2 text-xs">Deliveries: <b>{g.count}</b> · Earliest: {new Date(g.earliest).toLocaleDateString()} · Latest: {new Date(g.latest).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Owed</div>
                    <div className="font-display text-2xl font-extrabold">₹{Number(g.total).toFixed(2)}</div>
                    <button
                      disabled={payM.isPending}
                      onClick={() => { const notes = prompt(`Pay ₹${Number(g.total).toFixed(2)} to ${g.rider?.name ?? "rider"}? Optional reference/notes:`) ?? ""; payM.mutate({ rider_id: g.rider_id, notes }); }}
                      className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <BadgeCheck className="h-3.5 w-3.5" /> Mark paid
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold inline-flex items-center gap-2"><History className="h-5 w-5" /> Payout history</h2>
        {history.isLoading ? <Loader2 className="mt-6 h-6 w-6 animate-spin text-muted-foreground" /> : (
          <div className="mt-3 overflow-x-auto rounded-2xl border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b"><th className="p-3">Rider</th><th>Amount</th><th>Period</th><th>Paid at</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {(history.data ?? []).map((p: any) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3 font-semibold">{p.riders?.name ?? "—"}<div className="text-xs text-muted-foreground">{p.riders?.phone}</div></td>
                    <td className="font-display font-bold">₹{Number(p.amount).toFixed(2)}</td>
                    <td className="text-xs">{p.period_start ? new Date(p.period_start).toLocaleDateString() : "—"} → {p.period_end ? new Date(p.period_end).toLocaleDateString() : "—"}</td>
                    <td className="text-xs">{new Date(p.paid_at).toLocaleString()}</td>
                    <td className="text-xs text-muted-foreground">{p.notes ?? ""}</td>
                  </tr>
                ))}
                {(history.data ?? []).length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No payouts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FeeEditor({ fee, onSaved }: { fee: number; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(fee);
  const m = useMutation({
    mutationFn: () => adminSetRiderFee({ data: { fee: val } }),
    onSuccess: () => { toast.success("Fee updated"); setOpen(false); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!open) return (
    <button onClick={() => { setVal(fee); setOpen(true); }} className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-bold hover:bg-secondary">
      <Settings2 className="h-3.5 w-3.5" /> Per-delivery fee: ₹{fee}
    </button>
  );
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold">₹</span>
      <input type="number" min={0} value={val} onChange={(e) => setVal(Number(e.target.value))} className="w-24 rounded-lg border bg-background px-2 py-1.5 text-sm" />
      <button onClick={() => m.mutate()} disabled={m.isPending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">{m.isPending ? "…" : "Save"}</button>
      <button onClick={() => setOpen(false)} className="rounded-lg border px-3 py-1.5 text-xs">Cancel</button>
    </div>
  );
}
