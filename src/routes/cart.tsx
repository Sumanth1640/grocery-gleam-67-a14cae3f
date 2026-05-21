import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cartStore, cartTotals, useCart } from "@/lib/cart-store";
import { applyCoupon, COUPONS, type Coupon } from "@/lib/food-data";
import { Minus, Plus, Trash2, ShoppingBag, Clock, Tag, Check, X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — freshcart" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { items, itemsCount, subtotal, savings, delivery } = cartTotals(cart);

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const couponResult = useMemo(
    () => (coupon ? applyCoupon(coupon.code, subtotal) : null),
    [coupon, subtotal],
  );
  const discount = couponResult?.ok ? couponResult.discount : 0;
  const total = subtotal + delivery - discount;

  const handleApply = (raw?: string) => {
    setError(null);
    const c = (raw ?? code).trim();
    if (!c) return;
    const res = applyCoupon(c, subtotal);
    if (!res.ok) { setError(res.reason ?? "Invalid coupon"); setCoupon(null); return; }
    setCoupon(res.coupon!);
    setCode(c.toUpperCase());
  };

  if (itemsCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-secondary">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add fresh groceries and they'll show up here.</p>
          <Link to="/" className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Start shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">My cart</h1>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
          <Clock className="h-3.5 w-3.5" /> Delivery in 11 minutes
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="space-y-3">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-4 rounded-2xl border bg-card p-3 shadow-card">
                  <img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to="/p/$id" params={{ id: product.slug }} className="line-clamp-2 text-sm font-semibold">
                      {product.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{product.weight}</div>
                    <div className="mt-1 text-sm font-bold">
                      ₹{product.price * qty}{" "}
                      {product.mrp > product.price && (
                        <span className="ml-1 text-xs font-medium text-muted-foreground line-through">
                          ₹{product.mrp * qty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground">
                    <button onClick={() => cartStore.remove(product.id)} className="grid h-8 w-8 place-items-center">
                      {qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    </button>
                    <span className="min-w-5 text-center text-xs font-bold">{qty}</span>
                    <button onClick={() => cartStore.add(product)} className="grid h-8 w-8 place-items-center">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
              {coupon && couponResult?.ok && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-success bg-success/5 p-3 text-xs">
                  <div className="inline-flex items-center gap-1.5 font-bold text-success"><Check className="h-3.5 w-3.5" />{coupon.code} applied — saved ₹{discount}</div>
                  <button onClick={() => { setCoupon(null); setCode(""); }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Available offers</div>
                {COUPONS.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleApply(c.code)}
                    className="flex w-full items-start justify-between gap-3 rounded-xl border border-dashed p-3 text-left transition hover:bg-secondary"
                  >
                    <div>
                      <div className="text-sm font-bold">{c.code}</div>
                      <div className="text-xs text-muted-foreground">{c.desc}</div>
                    </div>
                    <span className="rounded-md bg-discount/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-discount">Apply</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card md:sticky md:top-20">
            <h3 className="font-display text-lg font-bold">Bill details</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Item subtotal" value={`₹${subtotal}`} />
              {savings > 0 && <Row label="Product savings" value={`- ₹${savings}`} positive />}
              {discount > 0 && <Row label={`Coupon (${coupon?.code})`} value={`- ₹${discount}`} positive />}
              <Row label={delivery > 0 ? "Delivery fee" : "Delivery"} value={delivery > 0 ? `₹${delivery}` : "FREE"} positive={delivery === 0} />
              {delivery > 0 && (
                <p className="rounded-md bg-accent/60 p-2 text-[11px] text-muted-foreground">
                  Add ₹{199 - subtotal} more for free delivery
                </p>
              )}
            </dl>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="font-display text-lg font-bold">To pay</div>
              <div className="font-display text-xl font-extrabold">₹{total}</div>
            </div>
            <Link
              to="/checkout"
              search={{ coupon: coupon?.code }}
              className="mt-5 block w-full rounded-xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground shadow-pop transition hover:opacity-95"
            >
              Proceed to checkout
            </Link>
            <button onClick={() => cartStore.clear()} className="mt-2 w-full rounded-xl border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary">
              Clear cart
            </button>
          </aside>
        </div>
      </div>
      <Footer />
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
