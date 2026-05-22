import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { partnerPayouts } from "@/lib/partner.functions";
import { Loader2, IndianRupee, Wallet, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/partner/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Partner" }] }),
  component: PayoutsPage,
});

const inr = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

function PayoutsPage() {
  const [days, setDays] = useState(30);
  const fn = useServerFn(partnerPayouts);
  const q = useQuery({ queryKey: ["partner-payouts", days], queryFn: () => fn({ data: { days } }) });

  if (q.isLoading) return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!q.data) return <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Complete your restaurant profile to see payouts.</div>;

  const { restaurant, rows, totals, weekly } = q.data;

  const exportCsv = () => {
    const header = ["Order ID", "Date", "Status", "Gross", "Commission", "Payout"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push([r.id, new Date(r.date).toISOString(), r.status, r.gross, r.commission, r.payout].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `settlement-${days}d.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Payouts &amp; settlement</h1>
          <p className="text-xs text-muted-foreground">Commission {restaurant.commission_rate}% · Bank a/c ****{(restaurant.bank_account_number ?? "").slice(-4)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-xl border bg-card p-1">
            {[7, 30, 90].map((v) => (
              <button key={v} onClick={() => setDays(v)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${days === v ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>{v}d</button>
            ))}
          </div>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary"><Download className="h-3.5 w-3.5" /> CSV</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card icon={IndianRupee} label="Gross sales" value={inr(totals.gross)} />
        <Card icon={IndianRupee} label="Commission" value={`−${inr(totals.commission)}`} tone="text-destructive" />
        <Card icon={Wallet} label="Net payout" value={inr(totals.payout)} tone="text-primary" />
        <Card icon={IndianRupee} label="Orders" value={totals.orders} />
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-bold">Weekly settlement</h3>
        {weekly.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Week starting</th><th>Orders</th><th>Gross</th><th>Commission</th><th>Payout</th></tr>
              </thead>
              <tbody>
                {weekly.map((w) => (
                  <tr key={w.week} className="border-t">
                    <td className="py-2 font-semibold">{w.week}</td>
                    <td>{w.orders}</td>
                    <td>{inr(w.gross)}</td>
                    <td className="text-destructive">−{inr(w.commission)}</td>
                    <td className="font-bold">{inr(w.payout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-card">
        <h3 className="mb-3 text-sm font-bold">Order ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Order</th><th>Date</th><th>Status</th><th>Gross</th><th>Commission</th><th>Payout</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 font-mono text-xs">{r.id.slice(0, 8)}</td>
                  <td className="text-xs">{new Date(r.date).toLocaleDateString()}</td>
                  <td><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase">{r.status}</span></td>
                  <td>{inr(r.gross)}</td>
                  <td className="text-destructive">−{inr(r.commission)}</td>
                  <td className="font-bold">{inr(r.payout)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No orders in this period.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Icon, label, value, tone = "" }: { icon: any; label: string; value: any; tone?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-display text-xl font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}
