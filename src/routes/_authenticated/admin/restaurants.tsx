import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListRestaurants, adminSetRestaurantStatus } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/restaurants")({
  component: AdminRestaurantsPage,
});

type Status = "pending" | "approved" | "rejected" | "all";

function AdminRestaurantsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListRestaurants);
  const setFn = useServerFn(adminSetRestaurantStatus);
  const [filter, setFilter] = useState<Status>("pending");

  const q = useQuery({
    queryKey: ["admin-restaurants", filter],
    queryFn: () => listFn({ data: { status: filter } }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" | "pending" }) =>
      setFn({ data: { id, status } }),
    onSuccess: () => {
      toast.success("Updated");
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
            <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-card">
              {r.image && <img src={r.image} alt="" className="h-16 w-16 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-display text-base font-bold">{r.name}</div>
                  <StatusPill status={r.status} />
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{r.cuisines.join(" · ")} · {r.area} · ETA {r.eta_mins}m · ₹{r.cost_for_two} for two</div>
                <div className="mt-1 text-[11px] text-muted-foreground">/{r.slug} · Owner: {r.owner_id.slice(0, 8)}…</div>
              </div>
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: "approved" })} disabled={setStatus.isPending} className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1.5 text-xs font-bold text-success-foreground hover:opacity-90 disabled:opacity-50">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })} disabled={setStatus.isPending} className="inline-flex items-center gap-1 rounded-full border border-destructive bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/15 disabled:opacity-50">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
                {r.status !== "pending" && (
                  <button onClick={() => setStatus.mutate({ id: r.id, status: "pending" })} disabled={setStatus.isPending} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary disabled:opacity-50">
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tint = status === "approved" ? "bg-success/15 text-success" : status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tint}`}>{status}</span>;
}
