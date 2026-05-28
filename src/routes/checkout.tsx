import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cartStore, cartTotals, useCart } from "@/lib/cart-store";
import { orderStore, type Address, type PaymentMethod } from "@/lib/order-store";
import { placeOrder as placeOrderFn, createAddress } from "@/lib/account.functions";
import { dualApi } from "@/lib/dual-api";

import { createRazorpayOrder, verifyAndPlaceOrder } from "@/lib/razorpay.functions";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { resolveWarehouseForPincode } from "@/lib/fulfillment.functions";
import { useQuery } from "@tanstack/react-query";
import { applyCoupon, listActiveCoupons, type Coupon } from "@/lib/public-coupons";
import { listMyCouponUsage } from "@/lib/coupons.functions";
import { supabase } from "@/integrations/supabase/client";
import { SavedAddressPicker } from "@/components/site/SavedAddressPicker";
import { DeliverySlotPicker } from "@/components/site/DeliverySlotPicker";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CreditCard,
  Home as HomeIcon,
  MapPin,
  Smartphone,
  Wallet,
} from "lucide-react";

const searchSchema = z.object({ coupon: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — hallifresh" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: CheckoutPage,
});

type Step = 1 | 2 | 3;

const emptyAddress: Address = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  pincode: "",
  type: "Home",
};

function CheckoutPage() {
  const cart = useCart();
  const baseTotals = cartTotals(cart);
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { data: availableCoupons = [] } = useQuery({
    queryKey: ["active-coupons"],
    queryFn: listActiveCoupons,
  });
  const myUsageRpc = useServerFn(listMyCouponUsage);
  const { data: myUsage = {} } = useQuery({
    queryKey: ["my-coupon-usage"],
    queryFn: () => myUsageRpc(),
  });

  const couponData: Coupon | null = useMemo(() => {
    if (!search.coupon) return null;
    const r = applyCoupon(availableCoupons, search.coupon, baseTotals.subtotal, myUsage);
    return r.ok ? r.coupon! : null;
  }, [availableCoupons, search.coupon, baseTotals.subtotal, myUsage]);
  const discount = couponData
    ? applyCoupon(availableCoupons, couponData.code, baseTotals.subtotal, myUsage).discount
    : 0;
  const totals = { ...baseTotals, total: baseTotals.subtotal + baseTotals.delivery - discount };
  const placeOrderRpc = useServerFn(placeOrderFn);
  const saveAddressRpc = useServerFn(createAddress);
  const resolveWhRpc = useServerFn(resolveWarehouseForPincode);
  const createRpOrderRpc = useServerFn(createRazorpayOrder);
  const verifyAndPlaceRpc = useServerFn(verifyAndPlaceOrder);
  const [saveAddr, setSaveAddr] = useState(true);

  const whQ = useQuery({
    queryKey: ["resolve-warehouse", address.pincode],
    queryFn: () => resolveWhRpc({ data: { pincode: address.pincode } }),
    enabled: /^\d{6}$/.test(address.pincode),
    staleTime: 60_000,
  });

  if (totals.itemsCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">Your cart is empty</h1>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop"
          >
            Start shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const addressValid =
    address.fullName.trim().length > 1 &&
    /^\d{10}$/.test(address.phone) &&
    address.line1.trim().length > 2 &&
    address.city.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode);

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const payload = {
        items: totals.items.map((i) => ({
          product: {
            id: i.product.id,
            name: i.product.name,
            weight: i.product.weight,
            price: i.product.price,
            mrp: i.product.mrp,
            image: i.product.image,
          },
          qty: i.qty,
        })),
        address: {
          full_name: address.fullName.trim(),
          phone: address.phone,
          line1: address.line1.trim(),
          line2: address.line2?.trim() || null,
          city: address.city.trim(),
          pincode: address.pincode,
          type: address.type,
          is_default: false,
        },
        payment,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        coupon_id: couponData?.id ?? null,
        coupon_discount: discount,
        scheduled_for: scheduledFor,
      };

      const finalize = (row: { id: string; created_at: string }) => {
        if (saveAddr) {
          saveAddressRpc({ data: payload.address }).catch(() => {
            /* ignore */
          });
        }
        orderStore.place({
          id: row.id,
          items: totals.items,
          address,
          payment,
          subtotal: totals.subtotal,
          delivery: totals.delivery,
          total: totals.total,
          placedAt: new Date(row.created_at).getTime(),
          eta: "11 minutes",
        });
        cartStore.clear();
        void navigate({ to: "/order-success", search: { order: row.id } });
      };

      if (payment === "cod") {
      if (payment === "cod") {
        if (dualApi.mode === "php") {
          const r = await dualApi.createOrder(payload);
          finalize({ id: r.id, created_at: new Date().toISOString() });
        } else {
          const row = await placeOrderRpc({ data: payload });
          finalize(row);
        }
        return;
      }

      const rp = await createRpOrderRpc({ data: { amount: payload.total } });
      await openRazorpayCheckout({
        key: rp.key_id,
        amount: rp.amount,
        currency: rp.currency,
        order_id: rp.order_id,
        name: "hallifresh",
        description: `Grocery order · ${payload.items.length} item(s)`,
        prefill: { name: payload.address.full_name, contact: payload.address.phone },
        theme: { color: "#16a34a" },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            toast.message("Payment cancelled");
          },
        },
        handler: async (resp) => {
          try {
            const row = await verifyAndPlaceRpc({
              data: {
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
                order: { ...payload, payment: payment as "upi" | "card" },
              },
            });
            finalize(row);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Payment verification failed");
            setSubmitting(false);
          }
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to cart
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold md:text-3xl">Checkout</h1>

        <Stepper step={step} />

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
            {step === 1 && (
              <>
                <SavedAddressPicker
                  onPick={(a) =>
                    setAddress({
                      ...address,
                      fullName: a.fullName,
                      phone: a.phone,
                      line1: a.line1,
                      line2: a.line2 ?? "",
                      city: a.city,
                      pincode: a.pincode,
                      type: a.type,
                    })
                  }
                  activeSignature={
                    address.line1 ? `${address.line1}|${address.pincode}` : undefined
                  }
                />
                <AddressStep address={address} setAddress={setAddress} />
              </>
            )}

            {step === 2 && (
              <>
                <PaymentStep payment={payment} setPayment={setPayment} />
                <div className="mt-5">
                  <DeliverySlotPicker
                    value={scheduledFor}
                    onChange={setScheduledFor}
                    baseEtaMins={11}
                  />
                </div>
              </>
            )}
            {step === 3 && <ReviewStep address={address} payment={payment} totals={totals} />}

            <div className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
              <button
                onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
                disabled={step === 1}
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => (s + 1) as Step)}
                  disabled={step === 1 && !addressValid}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop transition disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-95"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={submitting || (whQ.data && !whQ.data.serviceable) || false}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop transition disabled:opacity-60 hover:opacity-95"
                >
                  {submitting ? "Placing order…" : `Pay ₹${totals.total}`}
                </button>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card md:sticky md:top-20">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
              <Clock className="h-3.5 w-3.5" /> Delivery in 11 minutes
            </div>
            {whQ.data?.serviceable && whQ.data.warehouse && (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
                <div className="font-bold text-primary">
                  Delivered from {whQ.data.warehouse.name}
                </div>
                <div className="text-muted-foreground">
                  {whQ.data.warehouse.city} · {whQ.data.warehouse.pincode}
                </div>
              </div>
            )}
            {whQ.data && !whQ.data.serviceable && (
              <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive">
                We don't deliver to {address.pincode} yet.
              </div>
            )}
            <h3 className="mt-4 font-display text-lg font-bold">Order summary</h3>
            <ul className="mt-3 max-h-56 space-y-2 overflow-auto pr-1 text-xs">
              {totals.items.map(({ product, qty }) => (
                <li key={product.id} className="flex items-center gap-2">
                  <img src={product.image} alt="" className="h-9 w-9 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 font-semibold">{product.name}</div>
                    <div className="text-muted-foreground">Qty {qty}</div>
                  </div>
                  <div className="font-semibold">₹{product.price * qty}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm">
              <Row label="Subtotal" value={`₹${totals.subtotal}`} />
              {totals.savings > 0 && (
                <Row label="Savings" value={`- ₹${totals.savings}`} positive />
              )}
              <Row
                label="Delivery"
                value={totals.delivery > 0 ? `₹${totals.delivery}` : "FREE"}
                positive={totals.delivery === 0}
              />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="font-display text-lg font-bold">To pay</div>
              <div className="font-display text-xl font-extrabold">₹{totals.total}</div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Address", "Payment", "Review"];
  return (
    <div className="mt-5 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div key={l} className="flex flex-1 items-center gap-2">
            <div
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition ${
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <div
              className={`text-xs font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`}
            >
              {l}
            </div>
            {i < labels.length - 1 && <div className="ml-1 h-px flex-1 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function AddressStep({
  address,
  setAddress,
}: {
  address: Address;
  setAddress: (a: Address) => void;
}) {
  const set = <K extends keyof Address>(k: K, v: Address[K]) => setAddress({ ...address, [k]: v });

  return (
    <div>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-bold">Delivery address</h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Where should we deliver your order?</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <input
            value={address.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={inputCls}
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Phone (10 digits)">
          <input
            value={address.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            className={inputCls}
            placeholder="9876543210"
          />
        </Field>
        <Field label="Address line 1" className="sm:col-span-2">
          <input
            value={address.line1}
            onChange={(e) => set("line1", e.target.value)}
            className={inputCls}
            placeholder="Flat / House no, Building"
          />
        </Field>
        <Field label="Address line 2 (optional)" className="sm:col-span-2">
          <input
            value={address.line2 ?? ""}
            onChange={(e) => set("line2", e.target.value)}
            className={inputCls}
            placeholder="Street, Area, Landmark"
          />
        </Field>
        <Field label="City">
          <input
            value={address.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputCls}
            placeholder="Mumbai"
          />
        </Field>
        <Field label="Pincode (6 digits)">
          <input
            value={address.pincode}
            onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            className={inputCls}
            placeholder="400001"
          />
        </Field>
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold text-muted-foreground">Save as</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["Home", "Work", "Other"] as const).map((t) => {
            const active = address.type === t;
            return (
              <button
                key={t}
                onClick={() => set("type", t)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"
                }`}
              >
                <HomeIcon className="h-3.5 w-3.5" /> {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PaymentStep({
  payment,
  setPayment,
}: {
  payment: PaymentMethod;
  setPayment: (p: PaymentMethod) => void;
}) {
  const opts = [
    { id: "upi" as const, label: "UPI", desc: "GPay, PhonePe, Paytm and more", icon: Smartphone },
    {
      id: "card" as const,
      label: "Credit / Debit card",
      desc: "Visa, Mastercard, RuPay",
      icon: CreditCard,
    },
    {
      id: "cod" as const,
      label: "Cash on delivery",
      desc: "Pay in cash when your order arrives",
      icon: Wallet,
    },
  ];
  return (
    <div>
      <h2 className="font-display text-lg font-bold">Payment method</h2>
      <p className="mt-1 text-xs text-muted-foreground">Choose how you'd like to pay.</p>
      <div className="mt-5 space-y-2.5">
        {opts.map((o) => {
          const active = payment === o.id;
          const Icon = o.icon;
          return (
            <button
              key={o.id}
              onClick={() => setPayment(o.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                active ? "border-primary bg-primary/5 ring-focus" : "hover:bg-secondary"
              }`}
            >
              <div
                className={`grid h-10 w-10 place-items-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
              </div>
              <div
                className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? "border-primary" : "border-border"}`}
              >
                {active && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewStep({
  address,
  payment,
  totals,
}: {
  address: Address;
  payment: PaymentMethod;
  totals: ReturnType<typeof cartTotals>;
}) {
  const payLabel =
    payment === "upi" ? "UPI" : payment === "card" ? "Credit / Debit card" : "Cash on delivery";
  return (
    <div>
      <h2 className="font-display text-lg font-bold">Review your order</h2>
      <p className="mt-1 text-xs text-muted-foreground">Make sure everything looks right.</p>

      <div className="mt-5 space-y-4">
        <Block title="Delivering to">
          <div className="text-sm font-semibold">
            {address.fullName} <span className="text-muted-foreground">· {address.phone}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city} — {address.pincode}
          </div>
          <div className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {address.type}
          </div>
        </Block>

        <Block title="Paying with">
          <div className="text-sm font-semibold">{payLabel}</div>
        </Block>

        <Block title={`${totals.itemsCount} item${totals.itemsCount > 1 ? "s" : ""}`}>
          <div className="text-xs text-muted-foreground">
            Total to pay: <span className="font-bold text-foreground">₹{totals.total}</span>
          </div>
        </Block>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-secondary/30 p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
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

const inputCls =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-focus";
