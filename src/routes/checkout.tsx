import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { cartStore, cartTotals, useCart } from "@/lib/cart-store";
import { orderStore } from "@/lib/order-store";
import { placeOrder as placeOrderFn } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, X, Minus, Plus, MapPin, Ticket, Banknote, ChevronRight, Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — hallifresh" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const { items, itemsCount, subtotal } = cartTotals(cart);
  const navigate = useNavigate();
  const placeOrderRpc = useServerFn(placeOrderFn);
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ id: string } | null>(null);

  const deliveryCharges = 10;
  const taxes = 1;
  const discount = 3;
  const total = subtotal + deliveryCharges + taxes - discount;

  if (itemsCount === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6">
        <div className="grid place-items-center pt-24 text-center">
          <h1 className="font-display text-2xl font-extrabold">Your cart is empty</h1>
          <Link to="/" className="mt-6 rounded-full bg-cta px-6 py-3 text-sm font-extrabold text-cta-foreground shadow-pop">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  const place = async () => {
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          product: {
            id: i.product.id, name: i.product.name, weight: i.product.weight,
            price: i.product.price, mrp: i.product.mrp, image: i.product.image,
          },
          qty: i.qty,
        })),
        address: {
          full_name: "John Doe", phone: "0000000000",
          line1: "123 Main Street, City, State, Zip 1400",
          line2: null, city: "Dhaka", pincode: "000000", type: "Home" as const, is_default: false,
        },
        payment: "cod" as const,
        subtotal, delivery: deliveryCharges, total,
        coupon_id: null, coupon_discount: discount, scheduled_for: null,
      };
      const row = await placeOrderRpc({ data: payload });
      orderStore.place({
        id: row.id,
        items,
        address: { fullName: "John Doe", phone: "", line1: payload.address.line1, line2: "", city: "Dhaka", pincode: "", type: "Home" },
        payment: "cod", subtotal, delivery: deliveryCharges, total,
        placedAt: new Date(row.created_at).getTime(), eta: "11 minutes",
      });
      cartStore.clear();
      setConfirmed({ id: row.id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/" })} className="grid h-11 w-11 place-items-center rounded-full bg-card ring-1 ring-border">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-center font-display text-lg font-extrabold">Checkout</h1>
          <div className="h-11 w-11" />
        </div>

        {/* Items */}
        <div className="mt-5 space-y-3">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-muted/50">
                <img src={product.image} alt={product.name} className="h-16 w-16 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-display text-base font-extrabold">{product.name}</div>
                  <button onClick={() => cartStore.remove(product.id)} className="grid h-6 w-6 place-items-center text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">{product.weight}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm font-extrabold text-primary">${(product.price * qty).toFixed(2)}</div>
                  <div className="flex items-center gap-1 rounded-full bg-muted/60 p-0.5">
                    <button onClick={() => cartStore.remove(product.id)} className="grid h-7 w-7 place-items-center rounded-full bg-card">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-5 text-center text-xs font-extrabold">{qty}</span>
                    <button onClick={() => cartStore.add(product)} className="grid h-7 w-7 place-items-center rounded-full bg-card">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recipient */}
        <div className="mt-4 rounded-2xl bg-card p-4 ring-1 ring-border">
          <div className="flex items-start gap-3">
            <div className="grid h-20 w-20 place-items-center rounded-xl bg-[oklch(0.93_0.08_140)]">
              <MapPin className="h-7 w-7 text-[oklch(0.55_0.22_28)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-base font-extrabold">Recipient</div>
              <div className="mt-0.5 text-xs text-muted-foreground">John Doe,</div>
              <div className="text-xs text-muted-foreground">123 Main Street, City, State, Zip 1400</div>
              <div className="text-xs text-muted-foreground">Dhaka, Bangladesh</div>
            </div>
          </div>
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Delivery Instructions (Optional)"
            className="mt-3 w-full rounded-xl bg-muted/60 px-3 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Promo */}
        <button className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.9_0.06_240)]">
            <Ticket className="h-4 w-4 text-[oklch(0.45_0.15_240)]" />
          </span>
          <span className="flex-1 text-left font-display text-sm font-extrabold">Apply a promo</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Payment */}
        <div className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.92_0.08_150)]">
            <Banknote className="h-4 w-4 text-[oklch(0.4_0.13_150)]" />
          </span>
          <span className="flex-1 text-left font-display text-sm font-extrabold">Payment method</span>
          <span className="text-xs font-semibold text-muted-foreground">Cash</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Receipt */}
        <h2 className="mt-5 font-display text-base font-extrabold">Receipt</h2>
        <div className="mt-2 rounded-2xl bg-card p-4 ring-1 ring-border">
          <Row label="Sub total" value={`$${subtotal.toFixed(2)}`} bold />
          <Row label="Delivery Charges" value={`$${deliveryCharges.toFixed(2)}`} />
          <Row label="Taxes and Fees" value={`$${taxes.toFixed(2)}`} />
          <Row label="Discount" value={`-$${discount.toFixed(2)}`} />
          <div className="my-3 border-t border-dashed" />
          <Row label="Total (incl. VAT)" value={`$${total.toFixed(2)}`} big />
        </div>
      </div>

      {/* Sticky place order */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
        <div className="mx-auto max-w-md rounded-[2rem] bg-card p-3 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-border">
          <button
            onClick={place}
            disabled={submitting}
            className="w-full rounded-full bg-cta py-3.5 text-sm font-extrabold text-cta-foreground shadow-pop disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </div>

      {confirmed && (
        <SuccessModal
          onClose={() => navigate({ to: "/" })}
          onTrack={() => navigate({ to: "/order-success", search: { order: confirmed.id } })}
        />
      )}
    </div>
  );
}

function Row({ label, value, bold, big }: { label: string; value: string; bold?: boolean; big?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className={`${big ? "font-display font-extrabold" : bold ? "font-semibold" : "text-muted-foreground"}`}>{label}</div>
      <div className={`${big ? "font-display text-base font-extrabold" : "font-extrabold"}`}>{value}</div>
    </div>
  );
}

function SuccessModal({ onClose, onTrack }: { onClose: () => void; onTrack: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-card p-7 text-center shadow-pop">
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[oklch(0.85_0.18_140)] to-[oklch(0.5_0.15_150)] opacity-20 blur-xl" />
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.7_0.2_140)] to-[oklch(0.5_0.18_150)] text-white">
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
        </div>
        <h2 className="mt-5 font-display text-xl font-extrabold">Your order is confirmed!</h2>
        <p className="mt-2 text-sm text-muted-foreground">Order is accepted, and they are getting it ready.</p>
        <button onClick={onTrack} className="mt-5 w-full rounded-full border-2 border-cta py-3 text-sm font-extrabold text-cta">
          Track order
        </button>
        <button onClick={onClose} className="mt-2 w-full rounded-full bg-cta py-3 text-sm font-extrabold text-cta-foreground shadow-pop">
          Ok, got it
        </button>
      </div>
    </div>
  );
}
