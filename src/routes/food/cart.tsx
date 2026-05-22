import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { applyCoupon, couponDescription, listActiveCoupons, type Coupon } from "@/lib/public-coupons";
import { QtyStepper } from "@/components/site/DishCustomizeDialog";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Tag, Check, X, Trash2, Clock, Utensils } from "lucide-react";

export const Route = createFileRoute("/food/cart")({
  head: () => ({ meta: [{ title: "Your food cart — hallifresh" }] }),
  component: FoodCartPage,
});

function FoodCartPage() {
  const cart = useFoodCart();
  const [code, setCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: availableCoupons = [] } = useQuery({
    queryKey: ["active-coupons"],
    queryFn: listActiveCoupons,
  });

  const initialTotals = foodCartTotals(cart);
  const couponResult = appliedCoupon ? applyCoupon(availableCoupons, appliedCoupon.code, initialTotals.subtotal) : null;
  const discount = couponResult?.ok ? couponResult.discount : 0;
  const totals = foodCartTotals(cart, discount);

  const handleApply = (raw?: string) => {
    setError(null);
    const c = (raw ?? code).trim();
    if (!c) return;
    const res = applyCoupon(availableCoupons, c, initialTotals.subtotal);
    if (!res.ok) {
      setError(res.reason ?? "Invalid coupon");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(res.coupon!);
    setCode(c.toUpperCase());
  };

  if (totals.itemsCount === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
            <Utensils className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Your food cart is empty</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse restaurants and add some delicious meals.</p>
          <Link to="/food" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Browse restaurants
          </Link>
        </div>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  const restaurantName = totals.items[0].restaurantName;
  const restaurantSlug = totals.items[0].restaurantSlug;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <Link to="/food" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to restaurants
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">Your food cart</h1>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ordering from</div>
                  <Link to="/food/r/$slug" params={{ slug: restaurantSlug }} className="font-display text-lg font-bold hover:text-primary">
                    {restaurantName}
                  </Link>
                </div>
                <button
                  onClick={() => { if (confirm("Clear the food cart?")) foodCartStore.clear(); }}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
              <ul className="mt-4 divide-y">
                {totals.items.map((it) => (
                  <li key={it.lineId} className="flex items-start gap-3 py-4">
                    <img src={it.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{it.name}</div>
                      {(it.variant || it.addons.length > 0) && (
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {it.variant?.name}
                          {it.variant && it.addons.length > 0 ? " · " : ""}
                          {it.addons.map((a) => a.name).join(", ")}
                        </div>
                      )}
                      <div className="mt-1 text-xs font-semibold">₹{it.unitPrice} each</div>
                    </div>
                    <div className="text-right">
                      <QtyStepper qty={it.qty} onInc={() => foodCartStore.inc(it.lineId)} onDec={() => foodCartStore.dec(it.lineId)} />
                      <div className="mt-2 text-sm font-bold">₹{it.unitPrice * it.qty}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coupons */}
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-discount" />
                <h2 className="font-display text-base font-bold">Apply coupon</h2>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border bg-background px-3 py-2.5 text-sm uppercase outline-none focus:ring-focus"
                />
                <button onClick={() => handleApply()} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95">
                  Apply
                </button>
              </div>
              {error && <div className="mt-2 text-xs font-semibold text-discount">{error}</div>}
              {appliedCoupon && couponResult?.ok && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-success bg-success/5 p-3 text-xs">
                  <div className="inline-flex items-center gap-1.5 font-bold text-success"><Check className="h-3.5 w-3.5" />{appliedCoupon.code} applied — saved ₹{discount}</div>
                  <button onClick={() => { setAppliedCoupon(null); setCode(""); }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available offers</div>
                {availableCoupons.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                    No coupons available right now.
                  </div>
                ) : availableCoupons.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleApply(c.code)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-dashed p-3 text-left transition hover:bg-secondary"
                  >
                    <div>
                      <div className="text-sm font-bold">{c.code}</div>
                      <div className="text-xs text-muted-foreground">{couponDescription(c)}</div>
                    </div>
                    <span className="rounded-md bg-discount/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-discount">Apply</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card md:sticky md:top-20">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
              <Clock className="h-3.5 w-3.5" /> Delivery in 30–35 min
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">Bill summary</h3>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row label={`Item total (${totals.itemsCount})`} value={`₹${totals.subtotal}`} />
              {discount > 0 && <Row label={`Coupon (${appliedCoupon?.code})`} value={`- ₹${discount}`} positive />}
              <Row label="Delivery fee" value={totals.delivery > 0 ? `₹${totals.delivery}` : "FREE"} positive={totals.delivery === 0} />
              <Row label="Packaging" value={`₹${totals.packaging}`} />
              <Row label="Taxes (5%)" value={`₹${totals.taxes}`} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="font-display text-lg font-bold">To pay</div>
              <div className="font-display text-xl font-extrabold">₹{totals.total}</div>
            </div>
            <Link
              to="/food/checkout"
              search={{ coupon: appliedCoupon?.code }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95"
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={positive ? "font-semibold text-success" : "font-semibold"}>{value}</dd>
    </div>
  );
}
