import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { php } from "@/lib/php-api";
import { Loader2, Search, Lock, ExternalLink, Store, MapPin, ShoppingBag, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/partners")({
  head: () => ({ meta: [{ title: "Partners — Admin" }] }),
  component: AdminPartnersPage,
});

type Partner = {
  restaurant_id: string;
  restaurant_name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  is_blocked: boolean;
  is_open: boolean;
  commission_rate: number;
  city: string | null;
  area: string | null;
  user_id: string | null;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  outlets_count: number;
  orders_count: number;
  revenue: number;
};

function AdminPartnersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const query = useQuery({
    queryKey: ["admin-partners"],
    queryFn: () => php.admin.listPartners() as Promise<Partner[]>,
  });

  const filtered = useMemo(() => {
    const list = query.data ?? [];
    const needle = q.trim().toLowerCase();
    return list.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!needle) return true;
      return [p.restaurant_name, p.full_name, p.email, p.phone, p.slug, p.city, p.area]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [query.data, q, status]);

  const totalRevenue = (query.data ?? []).reduce((s, p) => s + (p.revenue || 0), 0);
  const totalOrders = (query.data ?? []).reduce((s, p) => s + (p.orders_count || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Partners</h1>
          <p className="text-xs text-muted-foreground">All restaurant partner accounts with their restaurant, outlets and order activity.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <Stat label="Partners" value={(query.data ?? []).length} />
          <Stat label="Orders" value={totalOrders} />
          <Stat label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone, slug, city…"
            className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex gap-1 rounded-full border bg-card p-1">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition ${status === s ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : query.isError ? (
        <div className="mt-6 rounded-2xl border bg-destructive/10 p-6 text-sm text-destructive">
          {(query.error as Error)?.message || "Failed to load partners"}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">No partners match.</div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Partner</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Outlets</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Commission</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.restaurant_id} className="border-t hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Store className="h-4 w-4 text-primary" /> {p.restaurant_name}
                      {p.is_blocked && <Lock className="h-3 w-3 text-destructive" />}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground flex items-center gap-1">
                      /{p.slug}
                      {(p.city || p.area) && (
                        <>
                          <span>·</span>
                          <MapPin className="h-3 w-3" />
                          {[p.area, p.city].filter(Boolean).join(", ")}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.full_name || "—"}</div>
                    <div className="text-[11px] text-muted-foreground">{p.email || "no email"}</div>
                    <div className="text-[11px] text-muted-foreground">{p.phone || "no phone"}</div>
                  </td>
                  <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.outlets_count}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3 w-3 text-muted-foreground" />{p.orders_count}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className="inline-flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{p.revenue.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{p.commission_rate}%</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/admin/restaurants"
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold hover:bg-secondary"
                    >
                      Manage <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-card px-3 py-2">
      <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className="font-display text-sm font-bold">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tint =
    status === "approved"
      ? "bg-success/15 text-success"
      : status === "rejected"
        ? "bg-destructive/15 text-destructive"
        : "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tint}`}>{status}</span>;
}
