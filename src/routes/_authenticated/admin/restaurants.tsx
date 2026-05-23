import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListRestaurants, adminSetRestaurantStatus, adminGetDocSignedUrl, adminSetRestaurantBlocked } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, ExternalLink, FileText, Lock, Unlock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/restaurants")({
  component: AdminRestaurantsPage,
});

type Status = "pending" | "approved" | "rejected" | "all";

function AdminRestaurantsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListRestaurants);
  const setFn = useServerFn(adminSetRestaurantStatus);
  const blockFn = useServerFn(adminSetRestaurantBlocked);
  const [filter, setFilter] = useState<Status>("pending");

  const q = useQuery({
    queryKey: ["admin-restaurants", filter],
    queryFn: () => listFn({ data: { status: filter } }),
  });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: "approved" | "rejected" | "pending"; commission_rate?: number; rejection_reason?: string | null }) =>
      setFn({ data: vars }),
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setBlocked = useMutation({
    mutationFn: (vars: { id: string; is_blocked: boolean }) => blockFn({ data: vars }),
    onSuccess: (_d, vars) => {
      toast.success(vars.is_blocked ? "Restaurant locked" : "Restaurant unlocked");
      qc.invalidateQueries({ queryKey: ["admin-restaurants"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const FILTERS: Array<{ k: Status; label: string }> = [
    { k: "pending", label: "Pending" },
    { k: "approved", label: "Approved" },
    { k: "rejected", label: "Rejected" },
    { k: "all", label: "All" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Restaurant approvals</h1>
        <div className="flex gap-1 rounded-full border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${filter === f.k ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (q.data ?? []).length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">No restaurants in this view.</div>
      ) : (
        <ul className="mt-6 grid gap-3">
          {(q.data ?? []).map((r) => (
            <RestaurantRow
              key={r.id}
              r={r}
              onAction={(vars) => setStatus.mutate(vars)}
              onToggleBlock={(vars) => setBlocked.mutate(vars)}
              pending={setStatus.isPending || setBlocked.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function RestaurantRow({ r, onAction, pending }: {
  r: any;
  onAction: (vars: { id: string; status: "approved" | "rejected" | "pending"; commission_rate?: number; rejection_reason?: string | null }) => void;
  pending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [commission, setCommission] = useState<number>(Number(r.commission_rate ?? 22));
  const [reason, setReason] = useState<string>(r.rejection_reason ?? "");

  return (
    <li className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-4">
        {r.image && <img src={r.image} alt="" className="h-16 w-16 rounded-xl object-cover" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-display text-base font-bold">{r.name}</div>
            <StatusPill status={r.status} />
            {r.agreement_accepted_at ? (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">Agreement signed</span>
            ) : (
              <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:text-yellow-400">No agreement</span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">{(r.cuisines ?? []).join(" · ")} · {r.area} · ETA {r.eta_mins}m · ₹{r.cost_for_two} for two</div>
          <div className="mt-1 text-[11px] text-muted-foreground">/{r.slug} · Owner: {r.owner_name || r.owner_id.slice(0, 8)} · {r.owner_email || "no email"} · {r.owner_phone || "no phone"}</div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary">
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} Details
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 rounded-xl border bg-secondary/30 p-4 sm:grid-cols-2">
          <DocLine label="FSSAI" number={r.fssai_number} expiry={r.fssai_expiry} path={r.fssai_doc_url} />
          <DocLine label="PAN" number={r.pan_number} path={r.pan_doc_url} />
          <DocLine label="GST" number={r.gst_number} path={r.gst_doc_url} />
          <DocLine label="Shop license" path={r.shop_license_doc_url} />
          <DocLine label="Bank proof" number={`${r.bank_account_name || ""} · A/c ${r.bank_account_number || "—"} · IFSC ${r.bank_ifsc || "—"}`} path={r.bank_proof_url} />
          <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Commission rate (%)</div>
              <input type="number" min={0} max={100} step="0.5" value={commission} onChange={(e) => setCommission(Number(e.target.value))} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block sm:col-span-2">
              <div className="mb-1 text-xs font-semibold text-muted-foreground">Rejection reason (required if rejecting)</div>
              <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border bg-background px-3 py-2 text-sm" placeholder="e.g. FSSAI document unclear, please re-upload" />
            </label>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {r.status !== "approved" && (
          <button onClick={() => onAction({ id: r.id, status: "approved", commission_rate: commission })} disabled={pending} className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1.5 text-xs font-bold text-success-foreground hover:opacity-90 disabled:opacity-50">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
          </button>
        )}
        {r.status !== "rejected" && (
          <button onClick={() => { if (!reason.trim()) { toast.error("Add a rejection reason"); return; } onAction({ id: r.id, status: "rejected", rejection_reason: reason }); }} disabled={pending} className="inline-flex items-center gap-1 rounded-full border border-destructive bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/15 disabled:opacity-50">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        )}
        {r.status !== "pending" && (
          <button onClick={() => onAction({ id: r.id, status: "pending" })} disabled={pending} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary disabled:opacity-50">
            <Clock className="h-3.5 w-3.5" /> Pending
          </button>
        )}
      </div>
    </li>
  );
}

function DocLine({ label, number, expiry, path }: { label: string; number?: string | null; expiry?: string | null; path?: string | null }) {
  const fn = useServerFn(adminGetDocSignedUrl);
  const [loading, setLoading] = useState(false);
  const open = async () => {
    if (!path) return;
    setLoading(true);
    try {
      const { url } = await fn({ data: { path } });
      window.open(url, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-bold"><FileText className="h-3.5 w-3.5 text-primary" /> {label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{number || "—"}{expiry ? ` · expires ${expiry}` : ""}</div>
      {path ? (
        <button onClick={open} disabled={loading} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />} View document
        </button>
      ) : (
        <div className="mt-2 text-[11px] text-destructive">Not uploaded</div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tint = status === "approved" ? "bg-success/15 text-success" : status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tint}`}>{status}</span>;
}
