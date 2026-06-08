import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { cartStore, cartTotals, useCart } from "@/lib/cart-store";
import { applyCoupon, type Coupon } from "@/lib/public-coupons";
import { dualApi } from "@/lib/dual-api";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

export function MobileCart() {
  const cart = useCart();
  const navigate = useNavigate();
  const { items, itemsCount, subtotal, savings, delivery } = cartTotals(cart);

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: availableCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ["active-coupons"],
    queryFn: async () => ((await dualApi.listCoupons()) as Coupon[]) ?? [],
  });
  const couponResult = useMemo(
    () => (coupon ? applyCoupon(availableCoupons, coupon.code, subtotal) : null),
    [availableCoupons, coupon, subtotal],
  );
  const discount = couponResult?.ok ? couponResult.discount : 0;
  const total = subtotal + delivery - discount;

  const handleApply = (raw?: string) => {
    setError(null);
    const c = (raw ?? code).trim();
    if (!c) return;
    const res = applyCoupon(availableCoupons, c, subtotal);
    if (!res.ok) {
      setError(res.reason ?? "Invalid coupon");
      setCoupon(null);
      return;
    }
    setCoupon(res.coupon ?? null);
  };

  if (itemsCount === 0) {
    return (
      <div className="min-h-screen bg-white pb-36" style={FONT}>
        <NativeHeader title="Your cart" onBack={() => history.back()} />
        <div className="grid place-items-center px-6 pt-24 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-zinc-100">
            <ShoppingBag className="h-9 w-9 text-zinc-400" strokeWidth={2} />
          </div>
          <h2 className="mt-5 font-display text-xl font-extrabold text-zinc-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-zinc-500">Add fresh groceries to get started.</p>
          <Link
            to="/"
            className="mt-6 rounded-2xl bg-[oklch(0.55_0.16_145)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-100"
          >
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-44" style={FONT}>
      <NativeHeader title={`Your cart · ${itemsCount}`} onBack={() => history.back()} />

      <div className="space-y-3 px-5 pt-3">
        {items.map(({ product, qty }) => (
          <div
            key={product.id}
            className="flex gap-3 rounded-[1.5rem] border border-zinc-100 bg-white p-3 shadow-sm"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h4 className="line-clamp-1 text-sm font-extrabold text-zinc-900">{product.name}</h4>
                <p className="text-[11px] font-semibold text-zinc-400">{product.weight}</p>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-zinc-900">₹{product.price * qty}</span>
                  {product.mrp > product.price && (
                    <span className="text-[11px] text-zinc-300 line-through">₹{product.mrp * qty}</span>
                  )}
                </div>
                <QtyStepper
                  qty={qty}
                  onMinus={() => cartStore.remove(product.id)}
                  onPlus={() => cartStore.add(product)}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => cartStore.clear()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-white py-3 text-xs font-bold text-zinc-500"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear cart
        </button>
      </div>

      {/* Coupon */}
      <div className="mt-5 px-5">
        <div className="rounded-[1.5rem] border border-zinc-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-zinc-700">
            <Tag className="h-4 w-4 text-[oklch(0.55_0.16_145)]" />
            <span className="text-sm font-extrabold">Apply coupon</span>
          </div>
          {coupon ? (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2.5">
              <div>
                <div className="text-xs font-black text-emerald-700">{coupon.code}</div>
                <div className="text-[11px] font-semibold text-emerald-600">−₹{discount} applied</div>
              </div>
              <button
                onClick={() => setCoupon(null)}
                className="text-[11px] font-bold text-emerald-700 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-bold outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30"
              />
              <button
                onClick={() => handleApply()}
                className="rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-extrabold text-white"
              >
                Apply
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-[11px] font-bold text-rose-500">{error}</p>}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 px-5">
        <div className="space-y-2 rounded-[1.5rem] border border-zinc-100 bg-white p-5 shadow-sm">
          <Row label="Subtotal" value={`₹${subtotal}`} />
          {savings > 0 && <Row label="Savings" value={`−₹${savings}`} positive />}
          {discount > 0 && <Row label="Coupon" value={`−₹${discount}`} positive />}
          <Row label={delivery === 0 ? "Delivery (FREE over ₹199)" : "Delivery"} value={delivery === 0 ? "Free" : `₹${delivery}`} />
          <div className="my-2 border-t border-dashed border-zinc-200" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-zinc-900">Total</span>
            <span className="font-display text-xl font-black text-zinc-900">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Sticky checkout */}
      <div className="fixed inset-x-0 bottom-24 z-40 px-5" style={FONT}>
        <button
          onClick={() => navigate({ to: "/checkout" })}
          className="flex w-full items-center justify-between rounded-[2rem] bg-[oklch(0.55_0.16_145)] px-6 py-4 text-white shadow-xl shadow-emerald-200"
        >
          <span className="text-sm font-extrabold">Proceed to checkout</span>
          <span className="font-display text-lg font-black">₹{total}</span>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-zinc-500">{label}</span>
      <span className={`font-extrabold ${positive ? "text-emerald-600" : "text-zinc-800"}`}>{value}</span>
    </div>
  );
}

function QtyStepper({ qty, onMinus, onPlus }: { qty: number; onMinus: () => void; onPlus: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-[oklch(0.55_0.16_145)] px-1.5 py-1.5 text-white">
      <button onClick={onMinus} className="grid h-6 w-6 place-items-center rounded-lg bg-white/15">
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
      <span className="min-w-[18px] text-center text-xs font-black">{qty}</span>
      <button onClick={onPlus} className="grid h-6 w-6 place-items-center rounded-lg bg-white/15">
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}

export function NativeHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pb-3 pt-10 backdrop-blur-xl" style={FONT}>
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" strokeWidth={2.5} />
        </button>
      )}
      <h1 className="font-display text-base font-extrabold text-zinc-900">{title}</h1>
    </header>
  );
}
