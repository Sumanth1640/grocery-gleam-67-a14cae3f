import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { php } from "@/lib/php-api";
import { Loader2, ArrowLeft, Store, MapPin, Mail, Phone, ShoppingBag, IndianRupee, ExternalLink, Lock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/partners/$id")({
  head: () => ({ meta: [{ title: "Partner — Admin" }] }),
  component: AdminPartnerDetailPage,
});

function AdminPartnerDetailPage() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["admin-partner", id],
    queryFn: () => php.admin.getPartner({ id }) as Promise<any>,
  });

  if (q.isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  if (q.isError) return <div className="mt-6 rounded-2xl border bg-destructive/10 p-6 text-sm text-destructive">{(q.error as Error)?.message}</div>;

  const p = q.data?.partner ?? {};
  const outlets = q.data?.outlets ?? [];
  const stats = q.data?.stats ?? {};
  const recent = q.data?.recent_orders ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/partners" className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to partners
        </Link>
        <div className="flex gap-2">
          <Link to="/admin/restaurants" className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary">
            Restaurant approvals <ExternalLink className="h-3 w-3" />
          </Link>
          <a href={`/food/r/${p.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold hover:bg-secondary">
            View public page <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex flex-wrap items-start gap-4">
          {p.image && <img src={p.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h1 className="font-display text-2xl font-bold">{p.name}</h1>
              <StatusPill status={p.status} />
              {p.is_blocked && <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive"><Lock className="h-3 w-3" /> Locked</span>}
              {p.is_open && <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success"><CheckCircle2 className="h-3 w-3" /> Open</span>}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              /{p.slug} {p.area && <>· <MapPin className="inline h-3 w-3" /> {p.area}</>} · ETA {p.eta_mins ?? "—"}m · ₹{p.cost_for_two ?? "—"} for two · {p.commission_rate}% commission
            </div>
            {p.cuisines?.length > 0 && <div className="mt-2 text-xs text-muted-foreground">{p.cuisines.join(" · ")}</div>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="text-xs font-bold uppercase text-muted-foreground">Owner</div>
          <div className="mt-2 flex items-center gap-3">
            {p.owner_avatar ? (
              <img src={p.owner_avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-sm font-bold">{(p.owner_name || "?").slice(0, 1)}</div>
            )}
            <div className="min-w-0">
              <div className="font-display text-base font-bold">{p.owner_name || "—"}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{p.owner_email || "no email"}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{p.owner_phone || "no phone"}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Outlets" value={stats.outlets_count ?? 0} />
          <Stat label="Orders" value={stats.orders_count ?? 0} />
          <Stat label="Revenue" value={`₹${(stats.revenue ?? 0).toLocaleString()}`} />
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="border-b px-5 py-3 font-display text-sm font-bold">Outlets ({outlets.length})</div>
        {outlets.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No outlets created yet.</div>
        ) : (
          <ul className="divide-y">
            {outlets.map((o: any) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-[11px] text-muted-foreground">{[o.area, o.address, o.pincode].filter(Boolean).join(" · ") || "—"} · ETA {o.eta_mins}m</div>
                </div>
                <div className="flex gap-1.5">
                  {o.is_active ? <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">ACTIVE</span> : <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">INACTIVE</span>}
                  {o.is_open ? <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">OPEN</span> : <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:text-yellow-400">CLOSED</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="border-b px-5 py-3 font-display text-sm font-bold">Recent orders ({recent.length})</div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Order</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Payment</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Placed</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o: any) => (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-[11px]">{String(o.id).slice(0, 8)}</td>
                  <td className="px-4 py-2">{o.customer_name || "—"}</td>
                  <td className="px-4 py-2"><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{o.status}</span></td>
                  <td className="px-4 py-2"><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{o.payment_status}</span></td>
                  <td className="px-4 py-2 text-right tabular-nums"><span className="inline-flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{Number(o.total).toLocaleString()}</span></td>
                  <td className="px-4 py-2 text-right text-[11px] text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border bg-card p-3 text-center shadow-card">
      <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className="font-display text-lg font-bold flex items-center justify-center gap-1"><ShoppingBag className="h-3.5 w-3.5 opacity-60" />{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tint = status === "approved" ? "bg-success/15 text-success" : status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tint}`}>{status}</span>;
}
