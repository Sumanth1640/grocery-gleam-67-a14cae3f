import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminReports } from "@/lib/admin-extra.functions";
import { Loader2, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
  component: ReportsPage,
});

const inr = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function ReportsPage() {
  const fn = useServerFn(adminReports);
  const [days, setDays] = useState(90);
  const q = useQuery({ queryKey: ["admin-reports", days], queryFn: () => fn({ data: { days } }) });

  if (q.isLoading) return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  const d = q.data!;
  const maxWeek = Math.max(1, ...d.gmvWeekly.map((w) => w.gmv));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold">Reports</h2>
        <div className="flex gap-1 rounded-xl border bg-card p-1">
          {[30, 90, 180, 365].map((v) => (
            <button key={v} onClick={() => setDays(v)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${days === v ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{v}d</button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Gross Merchandise Value (weekly)</h3>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total GMV</div>
            <div className="font-display text-xl font-extrabold">{inr(d.gmvTotal)}</div>
          </div>
        </div>
        <div className="mt-4 flex h-40 items-end gap-1">
          {d.gmvWeekly.map((w) => (
            <div key={w.week} className="group flex flex-1 flex-col items-center justify-end" title={`${w.week}: ${inr(w.gmv)} · ${w.orders} orders`}>
              <div className="w-full rounded-t bg-primary/80 transition hover:bg-primary" style={{ height: `${(w.gmv / maxWeek) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>{d.gmvWeekly[0]?.week}</span><span>{d.gmvWeekly[d.gmvWeekly.length - 1]?.week}</span>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold"><TrendingUp className="h-4 w-4" /> Coupon ROI</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Code</th><th>Uses</th><th>Discount</th><th>Revenue</th><th>ROI</th></tr>
            </thead>
            <tbody>
              {d.couponROI.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-mono font-semibold">{c.code}</td>
                  <td>{c.uses}</td>
                  <td className="text-destructive">−{inr(c.discount)}</td>
                  <td className="font-bold">{inr(c.revenue)}</td>
                  <td className={c.roi >= 0 ? "text-success" : "text-destructive"}>{c.roi}%</td>
                </tr>
              ))}
              {d.couponROI.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No coupon redemptions in this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-bold">Cohort retention (% repeat)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Cohort</th><th>New users</th><th>M+1</th><th>M+2</th><th>M+3</th></tr>
            </thead>
            <tbody>
              {d.cohorts.map((c) => (
                <tr key={c.cohort} className="border-t">
                  <td className="py-2 font-mono">{c.cohort}</td>
                  <td>{c.size}</td>
                  <td><CohortCell v={c.m1} /></td>
                  <td><CohortCell v={c.m2} /></td>
                  <td><CohortCell v={c.m3} /></td>
                </tr>
              ))}
              {d.cohorts.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No cohort data.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CohortCell({ v }: { v: number }) {
  const intensity = Math.min(1, v / 60);
  return (
    <span className="inline-block min-w-[3rem] rounded px-2 py-0.5 text-center text-xs font-semibold"
      style={{ background: `color-mix(in oklab, var(--primary) ${intensity * 100}%, transparent)`, color: intensity > 0.4 ? "white" : "inherit" }}>
      {v}%
    </span>
  );
}
