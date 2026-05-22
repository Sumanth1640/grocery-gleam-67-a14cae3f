import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminAnalytics, adminSettlements } from "@/lib/admin.functions";
import { Loader2, IndianRupee, ShoppingBag, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AnalyticsPage,
});

const inr = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const analyticsFn = useServerFn(adminAnalytics);
  const settleFn = useServerFn(adminSettlements);
  const a = useQuery({ queryKey: ["admin-analytics", days], queryFn: () => analyticsFn({ data: { days } }) });
  const s = useQuery({ queryKey: ["admin-settlements", days], queryFn: () => settleFn({ data: { days } }) });

  if (a.isLoading) return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  const d = a.data!;
  const maxRev = Math.max(1, ...d.series.map((x) => x.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold">Sales analytics</h2>
        <div className="flex gap-1 rounded-xl border bg-card p-1">
          {[7, 30, 90].map((v) => (
            <button key={v} onClick={() => setDays(v)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${days === v ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{v}d</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={IndianRupee} label="Revenue" value={inr(d.revenue)} tint="bg-primary/10 text-primary" />
        <Stat icon={ShoppingBag} label="Orders" value={d.orders} tint="bg-brand/15 text-brand" />
        <Stat icon={TrendingUp} label="Avg. order value" value={inr(d.aov)} tint="bg-accent text-foreground" />
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-bold">Daily revenue</h3>
        <div className="flex h-40 items-end gap-1">
          {d.series.map((x) => (
            <div key={x.date} className="group flex flex-1 flex-col items-center justify-end">
              <div className="w-full rounded-t bg-primary/80 transition hover:bg-primary" style={{ height: `${(x.revenue / maxRev) * 100}%` }} title={`${x.date}: ${inr(x.revenue)} · ${x.orders} orders`} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>{d.series[0]?.date}</span><span>{d.series[d.series.length - 1]?.date}</span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-bold">Top items</h3>
          {d.topItems.length === 0 ? <p className="text-sm text-muted-foreground">No data yet.</p> : (
            <ul className="space-y-2">
              {d.topItems.map((it, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate"><span className="mr-2 text-muted-foreground">{i + 1}.</span>{it.name}</span>
                  <span className="shrink-0 text-right">
                    <span className="font-bold">{inr(it.revenue)}</span>
                    <span className="ml-2 text-xs text-muted-foreground">×{it.qty}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h3 className="mb-3 text-sm font-bold">Payment split</h3>
          <ul className="space-y-2">
            {d.paymentSplit.map((p) => (
              <li key={p.name} className="flex items-center justify-between text-sm">
                <span className="capitalize">{p.name}</span>
                <span className="font-bold">{p.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Settlements by restaurant</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Last {days} days</span>
        </div>
        {s.isLoading ? <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Restaurant</th><th>Orders</th><th>Gross</th><th>Commission</th><th>Payout</th></tr>
              </thead>
              <tbody>
                {(s.data ?? []).map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 font-semibold">{row.name} <span className="text-xs text-muted-foreground">({row.commission_rate}%)</span></td>
                    <td>{row.orders}</td>
                    <td>{inr(row.gross)}</td>
                    <td className="text-destructive">−{inr(row.commission)}</td>
                    <td className="font-bold">{inr(row.payout)}</td>
                  </tr>
                ))}
                {(s.data ?? []).length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No restaurant orders in this period.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: any; label: string; value: any; tint: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${tint}`}><Icon className="h-5 w-5" /></div>
      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-extrabold">{value}</div>
    </div>
  );
}
