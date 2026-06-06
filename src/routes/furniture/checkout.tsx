import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useFurnitureCart, furnitureCart, furnitureTotals } from "@/lib/furniture-cart-store";
import { php } from "@/lib/php-api";
import { useDualFn } from "@/lib/use-dual-fn";
import { dualApi } from "@/lib/dual-api";
import { placeOrder as placeOrderFn } from "@/lib/account.functions";
import { createRazorpayOrder, verifyAndPlaceOrder } from "@/lib/razorpay.functions";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, MapPin, Smartphone, Wallet } from "lucide-react";

export const Route = createFileRoute("/furniture/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Wooden Furniture" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { USE_PHP } = await import("@/lib/dual-api");
    if (USE_PHP) {
      const { phpAuth } = await import("@/lib/php-api");
      if (!phpAuth.get()) throw redirect({ to: "/login", search: { redirect: location.href } });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  component: FurnitureCheckoutPage,
});

type Payment = "upi" | "card" | "cod";

const DELIVERY_FEE = 999; // flat white-glove delivery

function FurnitureCheckoutPage() {
  const cart = useFurnitureCart();
  const { lines, count, total: subtotal } = furnitureTotals(cart);
  const navigate = useNavigate();
  const delivery = count > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  const [addr, setAddr] = useState({
    fullName: "", phone: "", line1: "", line2: "", city: "", pincode: "",
  });
  const [payment, setPayment] = useState<Payment>("upi");
  const [submitting, setSubmitting] = useState(false);

  const placeOrderRpc = useDualFn(placeOrderFn, (d) => php.createOrder(d));
  const createRp = useDualFn(createRazorpayOrder, (d: any) => php.createRazorpayOrder(d.amount));
  const verifyRp = useDualFn(verifyAndPlaceOrder, (d: any) => php.verifyAndPlaceOrder(d));

  const addressValid =
    addr.fullName.trim().length > 1 &&
    /^\d{10}$/.test(addr.phone) &&
    addr.line1.trim().length > 2 &&
    addr.city.trim().length > 1 &&
    /^\d{6}$/.test(addr.pincode);

  const submit = useMutation({
    mutationFn: async () => {
      const payload = {
        items: lines.map((l) => ({
          product: {
            id: l.id,
            name: l.name,
            weight: l.wood,
            price: l.price,
            mrp: l.price,
            image: l.image,
          },
          qty: l.qty,
        })),
        address: {
          full_name: addr.fullName.trim(),
          phone: addr.phone,
          line1: addr.line1.trim(),
          line2: addr.line2?.trim() || null,
          city: addr.city.trim(),
          pincode: addr.pincode,
          type: "Home" as const,
          is_default: false,
        },
        payment,
        subtotal,
        delivery,
        total,
      };

      if (payment === "cod") {
        if (dualApi.mode === "php") {
          const r = await dualApi.createOrder(payload);
          return { id: r.id, created_at: new Date().toISOString() };
        }
        const row = await placeOrderRpc({ data: payload });
        return row;
      }

      const rp = await createRp({ data: { amount: payload.total } });
      const row = await new Promise<{ id: string; created_at: string }>((resolve, reject) => {
        openRazorpayCheckout({
          key: rp.key_id,
          amount: rp.amount,
          currency: rp.currency,
          order_id: rp.order_id,
          name: "Wooden Furniture",
          description: `Furniture order · ${lines.length} item(s)`,
          prefill: { name: payload.address.full_name, contact: payload.address.phone },
          theme: { color: "#92400e" },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
          handler: async (resp) => {
            try {
              const r = await verifyRp({
                data: {
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  order: { ...payload, payment: payment as "upi" | "card" },
                },
              });
              resolve(r);
            } catch (e) { reject(e); }
          },
        });
      });
      return row;
    },
    onSuccess: (row) => {
      furnitureCart.clear();
      toast.success("Order placed!");
      void navigate({ to: "/furniture/order-success", search: { order: row.id } });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Could not place order");
      setSubmitting(false);
    },
  });

  if (count === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Your wishlist is empty</h1>
          <Link to="/furniture" className="mt-6 inline-block rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background">
            Browse furniture
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Link to="/furniture/cart" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to wishlist
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">Checkout</h1>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="font-display text-lg font-bold">Delivery address</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <input className={ic} value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} placeholder="Jane Doe" />
                </Field>
                <Field label="Phone (10 digits)">
                  <input className={ic} value={addr.phone} inputMode="numeric"
                    onChange={(e) => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="9876543210" />
                </Field>
                <Field label="Address line 1" className="sm:col-span-2">
                  <input className={ic} value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} placeholder="Flat / House no, Building" />
                </Field>
                <Field label="Address line 2 (optional)" className="sm:col-span-2">
                  <input className={ic} value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} placeholder="Street, Area, Landmark" />
                </Field>
                <Field label="City">
                  <input className={ic} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
                </Field>
                <Field label="Pincode (6 digits)">
                  <input className={ic} value={addr.pincode} inputMode="numeric"
                    onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
              <h2 className="font-display text-lg font-bold">Payment method</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <PayChoice icon={Smartphone} label="UPI" active={payment === "upi"} onClick={() => setPayment("upi")} />
                <PayChoice icon={CreditCard} label="Card" active={payment === "card"} onClick={() => setPayment("card")} />
                <PayChoice icon={Wallet} label="Cash on Delivery" active={payment === "cod"} onClick={() => setPayment("cod")} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                White-glove delivery includes carry-in, unboxing and basic assembly.
              </p>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card md:sticky md:top-20">
            <h3 className="font-display text-lg font-bold">Order summary</h3>
            <ul className="mt-3 max-h-56 space-y-2 overflow-auto pr-1 text-xs">
              {lines.map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <img src={l.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 font-semibold">{l.name}</div>
                    <div className="text-muted-foreground">{l.wood} · Qty {l.qty}</div>
                  </div>
                  <div className="font-semibold">₹{(l.price * l.qty).toLocaleString("en-IN")}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm">
              <Row label="Subtotal" value={`₹${subtotal.toLocaleString("en-IN")}`} />
              <Row label="White-glove delivery" value={`₹${delivery.toLocaleString("en-IN")}`} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="font-display text-lg font-bold">To pay</div>
              <div className="font-display text-xl font-extrabold">₹{total.toLocaleString("en-IN")}</div>
            </div>
            <button
              onClick={() => { setSubmitting(true); submit.mutate(); }}
              disabled={!addressValid || submitting || submit.isPending}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background shadow-pop disabled:opacity-50"
            >
              {submit.isPending ? "Processing…" : payment === "cod" ? `Place order · ₹${total.toLocaleString("en-IN")}` : `Pay ₹${total.toLocaleString("en-IN")}`}
            </button>
            {!addressValid && (
              <p className="mt-2 text-center text-[11px] text-muted-foreground">Fill the address to continue.</p>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const ic = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function PayChoice({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
        active ? "border-foreground bg-foreground/5" : "hover:border-foreground/40"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
