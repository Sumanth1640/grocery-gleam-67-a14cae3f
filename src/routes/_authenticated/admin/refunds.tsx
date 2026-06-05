import { createFileRoute } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminListRefunds, adminResolveRefund } from "@/lib/admin-extra.functions";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/refunds")({
  head: () => ({ meta: [{ title: "Refunds — Admin" }] }),
  component: RefundsPage,
});

function RefundsPage() {
  const listFn = useDualFn(adminListRefunds, (d) => php.admin.listRefunds(d));
  const resolveFn = useDualFn(adminResolveRefund, (d) => php.admin.resolveRefund(d));
  const qc = useQueryClient();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const q = useQuery({
    queryKey: ["admin-refunds", status],
    queryFn: () => listFn({ data: { status } }),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });

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

function parseProofs(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try { const j = JSON.parse(raw); return Array.isArray(j) ? j.filter((x: unknown): x is string => typeof x === "string") : []; }
    catch { return []; }
  }
  return [];
}

function ProofThumbs({ urls }: { urls: string[] }) {
  const [resolved, setResolved] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: string[] = [];
      for (const u of urls) {
        if (u.startsWith("http://") || u.startsWith("https://")) {
          out.push(u);
        } else if (u.startsWith("refund-proofs://")) {
          const path = u.replace("refund-proofs://", "");
          const { data } = await supabase.storage.from("refund-proofs").createSignedUrl(path, 60 * 60);
          out.push(data?.signedUrl ?? "");
        } else {
          out.push(u);
        }
      }
      if (!cancelled) setResolved(out);
    })();
    return () => { cancelled = true; };
  }, [urls.join("|")]);

  if (urls.length === 0) return null;
  return (
    <div className="mt-2">
      <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Proof ({urls.length})</div>
      <div className="flex flex-wrap gap-2">
        {resolved.map((u, i) => (
          u ? (
            <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block h-20 w-20 overflow-hidden rounded-lg border bg-muted">
              <img src={u} alt={`proof-${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
            </a>
          ) : (
            <div key={i} className="grid h-20 w-20 place-items-center rounded-lg border bg-muted text-[10px] text-muted-foreground">…</div>
          )
        ))}
      </div>
    </div>
  );
}

function RefundCard({ r, onResolve }: { r: any; onResolve: (s: "approved" | "rejected", note: string) => void }) {
  const [note, setNote] = useState("");
  const proofs = parseProofs(r.proof_urls);
  const vstatus = (r.verification_status ?? "pending") as string;
  const canApprove = vstatus === "verified";
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">Order #{r.order_id.slice(0, 8)} · ₹{r.amount}</div>
          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
          <div className="mt-1 text-sm"><span className="font-semibold">Reason:</span> {r.reason}</div>
          {r.details && <div className="text-sm text-muted-foreground">{r.details}</div>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            r.status === "pending" ? "bg-warning/15 text-warning" :
            r.status === "approved" || r.status === "refunded" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}>{r.status}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            vstatus === "pending" ? "bg-warning/15 text-warning" :
            vstatus === "verified" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}>Mgr: {vstatus}</span>
        </div>
      </div>
      <ProofThumbs urls={proofs} />
      {r.verifier_note && <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs"><b>Manager note:</b> {r.verifier_note}</div>}
      {r.admin_note && <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">Admin: {r.admin_note}</div>}
      {r.status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)"
            className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm" />
          <button
            disabled={!canApprove}
            title={canApprove ? "Issue refund" : "Waiting for manager verification"}
            onClick={() => onResolve("approved", note)}
            className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-success-foreground disabled:cursor-not-allowed disabled:opacity-50">
            <Check className="h-3.5 w-3.5" /> {canApprove ? "Approve & Refund" : "Awaiting verification"}
          </button>
          <button onClick={() => onResolve("rejected", note)} className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">
            <X className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

