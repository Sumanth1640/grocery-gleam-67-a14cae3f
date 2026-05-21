import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myRestaurant } from "@/lib/partner.functions";
import { Loader2, Store, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/partner/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(myRestaurant);
  const q = useQuery({ queryKey: ["my-restaurant"], queryFn: () => fn() });

  if (q.isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const r = q.data;

  if (!r) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-8 text-center shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Store className="h-7 w-7" /></div>
        <h1 className="mt-4 font-display text-2xl font-bold">Welcome, partner!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Set up your restaurant profile to start receiving orders. Approval typically takes 24 hours.</p>
        <Link to="/partner/profile" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
          Create restaurant <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const statusMeta = r.status === "approved"
    ? { Icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Approved — live on freshcart" }
    : r.status === "rejected"
    ? { Icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Rejected — update your details" }
    : { Icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "Pending review" };
  const { Icon } = statusMeta;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 rounded-2xl border bg-card p-6 shadow-card">
        <div className={`inline-flex items-center gap-1.5 rounded-full ${statusMeta.bg} px-3 py-1 text-xs font-bold ${statusMeta.color}`}>
          <Icon className="h-3.5 w-3.5" /> {statusMeta.label}
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold">{r.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{r.cuisines?.join(" · ")} · {r.area}</p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="ETA" value={`${r.eta_mins}m`} />
          <Stat label="Cost for two" value={`₹${r.cost_for_two}`} />
          <Stat label="Rating" value={`${r.rating}★`} />
        </div>
      </div>
      <div className="grid gap-3">
        <Link to="/partner/menu" className="rounded-2xl border bg-card p-5 shadow-card hover:bg-secondary">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Quick action</div>
          <div className="mt-1 font-display text-lg font-bold">Manage menu</div>
          <div className="text-xs text-muted-foreground">Add, edit, or hide dishes.</div>
        </Link>
        <Link to="/partner/orders" className="rounded-2xl border bg-card p-5 shadow-card hover:bg-secondary">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Quick action</div>
          <div className="mt-1 font-display text-lg font-bold">View orders</div>
          <div className="text-xs text-muted-foreground">Update status as you cook.</div>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-secondary/30 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold">{value}</div>
    </div>
  );
}
