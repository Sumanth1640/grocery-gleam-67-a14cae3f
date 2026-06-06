import { createFileRoute } from "@tanstack/react-router";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/furniture-quotes")({
  head: () => ({ meta: [{ title: "Furniture quotes — Admin" }] }),
  component: AdminFurnitureQuotesPage,
});

const STATUSES = ["new", "contacted", "quoted", "converted", "closed"] as const;

function AdminFurnitureQuotesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-furniture-quotes"], queryFn: () => php.admin.listFurnitureQuotes() });
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const updM = useMutation({
    mutationFn: (p: { id: string; status: string; admin_note?: string }) => php.admin.updateFurnitureQuote(p),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-furniture-quotes"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading)
    return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const rows = q.data ?? [];
  const open = openId ? rows.find((r: any) => r.id === openId) : null;

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold">Furniture quote requests</h2>
      <div className="grid gap-3">
        {rows.map((r: any) => (
          <button
            key={r.id}
            onClick={() => { setOpenId(r.id); setNote(r.admin_note ?? ""); }}
            className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-left shadow-card hover:bg-secondary/40"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{r.name} <span className="text-muted-foreground">· {r.email}</span></div>
                <div className="truncate text-xs text-muted-foreground">
                  {(r.items ?? []).length} pieces · ₹{Number(r.total).toLocaleString("en-IN")} · {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <StatusBadge status={r.status} />
          </button>
        ))}
        {rows.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            No quote requests yet.
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 overflow-y-auto" onClick={() => setOpenId(null)}>
          <div className="my-auto w-full max-w-xl rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{open.name}</h3>
            <div className="text-xs text-muted-foreground">{open.email}{open.phone ? ` · ${open.phone}` : ""}</div>
            <div className="text-xs text-muted-foreground">{open.city || "—"}{open.pincode ? ` · ${open.pincode}` : ""}</div>
            {open.message && <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">{open.message}</p>}

            <div className="mt-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Items</div>
              {(open.items ?? []).map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{it.name} <span className="text-muted-foreground">× {it.qty}</span></span>
                  <span className="font-semibold">₹{(Number(it.price) * Number(it.qty)).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span>Indicative total</span><span>₹{Number(open.total).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <label className="mt-4 block">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Internal note</div>
              <textarea rows={2} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updM.mutate({ id: open.id, status: s, admin_note: note })}
                    className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase ${
                      open.status === s ? "border-foreground bg-foreground text-background" : "hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={() => setOpenId(null)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    new: "bg-primary/15 text-primary",
    contacted: "bg-warning/15 text-warning",
    quoted: "bg-accent/15 text-accent",
    converted: "bg-success/15 text-success",
    closed: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tone[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
