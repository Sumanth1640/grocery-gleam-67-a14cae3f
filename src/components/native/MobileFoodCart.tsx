import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { applyCoupon, couponDescription, listActiveCoupons, type Coupon } from "@/lib/public-coupons";
import { ChevronLeft, Check, Clock, Minus, Plus, Tag, Trash2, Utensils, X } from "lucide-react";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

export function MobileFoodCart() {
  const navigate = useNavigate();
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
    if (!res.ok) { setError(res.reason ?? "Invalid coupon"); setAppliedCoupon(null); return; }
    setAppliedCoupon(res.coupon!);
    setCode(c.toUpperCase());
  };

  if (totals.itemsCount === 0) {
    return (
      <div className="min-h-screen bg-white pb-32" style={FONT}>
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pt-10 pb-4 backdrop-blur">
          <button onClick={() => navigate({ to: "/food" })} className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100" aria-label="Back">
            <ChevronLeft className="h-5 w-5 text-zinc-700" />
          </button>
          <h1 className="text-lg font-extrabold text-zinc-900">Food cart</h1>
        </header>
        <div className="mx-5 mt-16 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
            <Utensils className="h-7 w-7 text-orange-500" />
          </div>
          <p className="mt-4 text-base font-extrabold text-zinc-900">No food in cart</p>
          <p className="mt-1 text-xs text-zinc-500">Browse restaurants and add a meal.</p>
          <Link to="/food" className="mt-5 inline-block rounded-2xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: GREEN }}>
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  const restaurantName = totals.items[0].restaurantName;
  const restaurantSlug = totals.items[0].restaurantSlug;

  return (
    <div className="min-h-screen bg-white pb-44" style={FONT}>
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pt-10 pb-4 backdrop-blur">
        <button onClick={() => navigate({ to: "/food" })} className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100" aria-label="Back">
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-zinc-900 leading-none">Food cart</h1>
          <Link to="/food/r/$slug" params={{ slug: restaurantSlug }} className="text-[11px] font-semibold" style={{ color: GREEN }}>
            From {restaurantName}
          </Link>
        </div>
        <button
          onClick={() => { if (confirm("Clear cart?")) foodCartStore.clear(); }}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100 text-zinc-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <div className="px-5 space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold text-orange-700">
          <Clock className="h-3 w-3" /> Delivery in 30–35 min
        </div>

        <ul className="space-y-2">
          {totals.items.map((it) => (
            <li key={it.lineId} className="flex items-start gap-3 rounded-3xl bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100">
              <img src={it.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-zinc-900">{it.name}</div>
                {(it.variant || it.addons.length > 0) && (
                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    {it.variant?.name}
                    {it.variant && it.addons.length > 0 ? " · " : ""}
                    {it.addons.map((a) => a.name).join(", ")}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-1 py-1">
                    <button onClick={() => foodCartStore.dec(it.lineId)} className="grid h-6 w-6 place-items-center rounded-full bg-white text-zinc-700">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[16px] text-center text-xs font-extrabold text-zinc-900">{it.qty}</span>
                    <button onClick={() => foodCartStore.inc(it.lineId)} className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: GREEN }}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-sm font-extrabold text-zinc-900">₹{it.unitPrice * it.qty}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Coupon */}
        <div className="rounded-3xl bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-extrabold text-zinc-900">Coupon</h2>
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 rounded-2xl border-none bg-zinc-100 px-3 py-2.5 text-sm font-bold uppercase outline-none"
            />
            <button onClick={() => handleApply()} className="rounded-2xl px-4 text-sm font-bold text-white" style={{ background: GREEN }}>
              Apply
            </button>
          </div>
          {error && <p className="mt-2 text-[11px] font-bold text-red-500">{error}</p>}
          {appliedCoupon && couponResult?.ok && (
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-green-50 p-3 text-xs">
              <span className="inline-flex items-center gap-1.5 font-bold text-green-700">
                <Check className="h-3.5 w-3.5" />{appliedCoupon.code} — saved ₹{discount}
              </span>
              <button onClick={() => { setAppliedCoupon(null); setCode(""); }} className="text-zinc-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {availableCoupons.length > 0 && (
            <div className="mt-3 space-y-2">
              {availableCoupons.slice(0, 3).map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleApply(c.code)}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-zinc-200 p-2.5 text-left"
                >
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">{c.code}</div>
                    <div className="text-[10px] text-zinc-500">{couponDescription(c)}</div>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600">Apply</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bill */}
        <div className="rounded-3xl bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100">
          <h3 className="text-sm font-extrabold text-zinc-900">Bill summary</h3>
          <dl className="mt-3 space-y-1.5 text-xs text-zinc-600">
            <Row label={`Item total (${totals.itemsCount})`} value={`₹${totals.subtotal}`} />
            {discount > 0 && <Row label={`Coupon (${appliedCoupon?.code})`} value={`-₹${discount}`} positive />}
            <Row label="Delivery" value={totals.delivery > 0 ? `₹${totals.delivery}` : "FREE"} positive={totals.delivery === 0} />
            <Row label="Packaging" value={`₹${totals.packaging}`} />
            <Row label="Taxes (5%)" value={`₹${totals.taxes}`} />
          </dl>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-sm font-bold text-zinc-700">To pay</span>
            <span className="text-xl font-extrabold text-zinc-900">₹{totals.total}</span>
          </div>
        </div>
      </div>

      {/* Sticky checkout */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-100 bg-white/95 px-5 py-3 backdrop-blur">
        <Link
          to="/food/checkout"
          search={{ coupon: appliedCoupon?.code }}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-200"
          style={{ background: GREEN }}
        >
          <span>{totals.itemsCount} items · ₹{totals.total}</span>
          <span>Checkout →</span>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className={`font-bold ${positive ? "text-green-600" : "text-zinc-900"}`}>{value}</dd>
    </div>
  );
}
