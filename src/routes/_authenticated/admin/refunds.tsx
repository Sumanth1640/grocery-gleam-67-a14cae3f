import { createFileRoute } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListRefunds, adminResolveRefund } from "@/lib/admin-extra.functions";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/refunds")({
  head: () => ({ meta: [{ title: "Refunds — Admin" }] }),
  component: RefundsPage,
});

function RefundsPage() {
  const listFn = useDualFn(adminListRefunds, (d) => php.admin.listRefunds(d));
  const resolveFn = useDualFn(adminResolveRefund, (d) => php.admin.resolveRefund(d));
  const qc = useQueryClient();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const q = useQuery({ queryKey: ["admin-refunds", status], queryFn: () => listFn({ data: { status } }) });

  const resolveM = useMutation({
    mutationFn: (v: { id: string; status: "approved" | "rejected"; admin_note: string }) => resolveFn({ data: v }),
    onSuccess: () => { toast.success("Refund updated"); qc.invalidateQueries({ queryKey: ["admin-refunds"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Refund / dispute requests</h2>
        <div className="flex gap-1 rounded-xl border bg-card p-1">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${status === s ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{s}</button>
          ))}
        </div>
      </div>

      {q.isLoading ? <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
        <div className="space-y-3">
          {(q.data ?? []).map((r: any) => (
            <RefundCard key={r.id} r={r} onResolve={(status, note) => resolveM.mutate({ id: r.id, status, admin_note: note })} />
          ))}
          {(q.data ?? []).length === 0 && <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No refund requests.</div>}
        </div>
      )}
    </div>
  );
}

function RefundCard({ r, onResolve }: { r: any; onResolve: (s: "approved" | "rejected", note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">Order #{r.order_id.slice(0, 8)} · ₹{r.amount}</div>
          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
          <div className="mt-1 text-sm"><span className="font-semibold">Reason:</span> {r.reason}</div>
          {r.details && <div className="text-sm text-muted-foreground">{r.details}</div>}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
          r.status === "pending" ? "bg-warning/15 text-warning" :
          r.status === "approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
        }`}>{r.status}</span>
      </div>
      {r.admin_note && <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">Admin: {r.admin_note}</div>}
      {r.status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)"
            className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm" />
          <button onClick={() => onResolve("approved", note)} className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-success-foreground">
            <Check className="h-3.5 w-3.5" /> Approve
          </button>
          <button onClick={() => onResolve("rejected", note)} className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">
            <X className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
