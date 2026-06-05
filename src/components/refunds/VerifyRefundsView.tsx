import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { managerListRefundsToVerify, managerVerifyRefund } from "@/lib/admin-extra.functions";
import { Loader2, Check, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function VerifyRefundsView() {
  const listFn = useDualFn(managerListRefundsToVerify, () => php.refunds.verifyList());
  const verifyFn = useDualFn(managerVerifyRefund, (d) => php.refunds.verify(d));
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const q = useQuery({ queryKey: ["mgr-refunds"], queryFn: () => listFn({ data: {} as never }) });

  const verifyM = useMutation({
    mutationFn: (v: { id: string; status: "verified" | "rejected"; verifier_note: string }) => verifyFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["mgr-refunds"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (q.data ?? []).filter((r: any) =>
    filter === "all" ? true : (r.verification_status ?? "pending") === filter
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Refunds to verify</h2>
          <p className="text-xs text-muted-foreground">Review the customer's proof, then admin will issue the refund.</p>
        </div>
        <div className="flex gap-1 rounded-xl border bg-card p-1">
          {(["pending", "verified", "rejected", "all"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${filter === s ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{s}</button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-3">
          {rows.map((r: any) => (
            <Card key={r.id} r={r} onAct={(status, note) => verifyM.mutate({ id: r.id, status, verifier_note: note })} />
          ))}
          {rows.length === 0 && <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No refund requests in this view.</div>}
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
        if (u.startsWith("http://") || u.startsWith("https://")) out.push(u);
        else if (u.startsWith("refund-proofs://")) {
          const path = u.replace("refund-proofs://", "");
          const { data } = await supabase.storage.from("refund-proofs").createSignedUrl(path, 60 * 60);
          out.push(data?.signedUrl ?? "");
        } else out.push(u);
      }
      if (!cancelled) setResolved(out);
    })();
    return () => { cancelled = true; };
  }, [urls.join("|")]);
  if (urls.length === 0) return <div className="mt-2 text-xs italic text-muted-foreground">No proof uploaded by customer.</div>;
  return (
    <div className="mt-2">
      <div className="mb-1 text-[11px] font-semibold uppercase text-muted-foreground">Proof ({urls.length})</div>
      <div className="flex flex-wrap gap-2">
        {resolved.map((u, i) => u ? (
          <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block h-20 w-20 overflow-hidden rounded-lg border bg-muted">
            <img src={u} alt={`proof-${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
          </a>
        ) : <div key={i} className="grid h-20 w-20 place-items-center rounded-lg border bg-muted text-[10px] text-muted-foreground">…</div>)}
      </div>
    </div>
  );
}

function Card({ r, onAct }: { r: any; onAct: (s: "verified" | "rejected", note: string) => void }) {
  const [note, setNote] = useState("");
  const proofs = parseProofs(r.proof_urls);
  const vstatus = (r.verification_status ?? "pending") as string;
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold">Order #{String(r.order_id).slice(0, 8)} · ₹{r.amount}</div>
          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
          <div className="mt-1 text-sm"><span className="font-semibold">Reason:</span> {r.reason}</div>
          {r.details && <div className="text-sm text-muted-foreground">{r.details}</div>}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            vstatus === "pending" ? "bg-warning/15 text-warning" :
            vstatus === "verified" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}>{vstatus}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Admin: {r.status}</span>
        </div>
      </div>
      <ProofThumbs urls={proofs} />
      {r.verifier_note && <div className="mt-2 rounded-lg bg-muted/50 p-2 text-xs">Note: {r.verifier_note}</div>}
      {vstatus === "pending" && r.status === "pending" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note (optional)"
            className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-1.5 text-sm" />
          <button onClick={() => onAct("verified", note)} className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-success-foreground">
            <Check className="h-3.5 w-3.5" /> Verify
          </button>
          <button onClick={() => onAct("rejected", note)} className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">
            <X className="h-3.5 w-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
