import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  MapPin,
  Plus,
  Home as HomeIcon,
  Briefcase,
  Tag as TagIcon,
  Smartphone,
  CreditCard,
  Wallet,
  Check,
  Clock,
  ShieldCheck,
  ChevronRight,
  X,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { orderStore, type Address, type PaymentMethod } from "@/lib/order-store";
import { dualApi } from "@/lib/dual-api";
import { applyCoupon, type Coupon } from "@/lib/public-coupons";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SavedAddr = {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  pincode: string;
  type: string;
  is_default?: boolean;
};

const emptyAddress: Address = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  pincode: "",
  type: "Home",
};

export function MobileFoodCheckout({ couponCode }: { couponCode?: string }) {
  const cart = useFoodCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState<Address>(emptyAddress);
  const [pickedSavedId, setPickedSavedId] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("upi");
  const [submitting, setSubmitting] = useState(false);
  const [saveAddr, setSaveAddr] = useState(true);

  const { data: availableCoupons = [] } = useQuery<Coupon[]>({
    queryKey: ["active-coupons"],
    queryFn: async () => ((await dualApi.listCoupons()) as Coupon[]) ?? [],
  });
  const { data: myUsage = {} } = useQuery<Record<string, number>>({
    queryKey: ["my-coupon-usage"],
    queryFn: async () => ((await dualApi.myCouponUsage()) as Record<string, number>) ?? {},
  });

  const subtotalForCoupon = foodCartTotals(cart).subtotal;
  const couponResult = useMemo(() => {
    if (!couponCode) return null;
    return applyCoupon(availableCoupons, couponCode, subtotalForCoupon, myUsage);
  }, [availableCoupons, couponCode, subtotalForCoupon, myUsage]);
  const coupon: Coupon | null = couponResult?.ok ? couponResult.coupon ?? null : null;
  const discount = couponResult?.ok ? couponResult.discount : 0;
  const totals = foodCartTotals(cart, discount);

  const { data: savedAddrs = [] } = useQuery<SavedAddr[]>({
    queryKey: ["addresses"],
    queryFn: async () => ((await dualApi.listAddresses()) as SavedAddr[]) ?? [],
  });

  useEffect(() => {
    if (pickedSavedId || addingNew || savedAddrs.length === 0) return;
    const def = savedAddrs.find((a) => a.is_default) ?? savedAddrs[0];
    setPickedSavedId(def.id);
    setAddress({
      fullName: def.full_name,
      phone: def.phone,
      line1: def.line1,
      line2: def.line2 ?? "",
      city: def.city,
      pincode: def.pincode,
      type: (def.type as Address["type"]) ?? "Home",
    });
    setSaveAddr(false);
  }, [savedAddrs, pickedSavedId, addingNew]);

  const restaurantId = totals.items[0]?.restaurantId;
  const customerPincode = (address.pincode ?? "").replace(/\D+/g, "");
  const outletQ = useQuery({
    queryKey: ["resolve-outlet", restaurantId, customerPincode],
    queryFn: () => dualApi.resolveOutlet(restaurantId!, null, null, customerPincode || null),
    enabled: !!restaurantId,
    staleTime: 60_000,
  });

  const outlet = (outletQ.data as { outlet?: { id: string; name: string; area?: string | null; pincode?: string | null; eta_mins?: number } } | undefined)?.outlet;
  const eta = outlet?.eta_mins ?? 30;

  const addressValid =
    address.fullName.trim().length > 1 &&
    /^\d{10}$/.test(address.phone) &&
    address.line1.trim().length > 2 &&
    address.city.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode);

  const canPlace = addressValid && !submitting;

  if (totals.itemsCount === 0) {
    return (
      <div className="min-h-screen bg-white pb-36" style={FONT}>
        <NativeHeader title="Food checkout" onBack={() => history.back()} />
        <div className="grid place-items-center px-6 pt-24 text-center">
          <h2 className="font-display text-xl font-extrabold text-zinc-900">Your food cart is empty</h2>
          <Link to="/food" className="mt-6 rounded-2xl bg-[oklch(0.55_0.16_145)] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-100">
            Browse restaurants
          </Link>
        </div>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!canPlace) return;
    setSubmitting(true);

    const rId = totals.items[0]?.restaurantId;
    if (!rId || !UUID_RE.test(rId)) {
      foodCartStore.clear();
      toast.error("This cart is from an old menu. Please add dishes again.");
      setSubmitting(false);
      void navigate({ to: "/food" });
      return;
    }

    const items = totals.items.map((it) => {
      const summary = [it.variant?.name, ...it.addons.map((a) => a.name)].filter(Boolean).join(" + ");
      return {
        product: {
          id: it.lineId,
          name: `${it.name}${summary ? ` (${summary})` : ""}`,
          weight: it.restaurantName,
          price: it.unitPrice,
          mrp: it.unitPrice,
          image: it.image,
        },
        qty: it.qty,
      };
    });

    const payload = {
      items,
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
      delivery: Math.max(0, totals.delivery + totals.packaging + totals.taxes - discount),
      total: totals.total,
      restaurant_id: rId,
      outlet_id: outlet?.id ?? null,
      coupon_id: coupon?.id ?? null,
      coupon_discount: discount,
      scheduled_for: null as string | null,
    };

    const finalize = (row: { id: string; created_at?: string }) => {
      if (saveAddr && !pickedSavedId) {
        dualApi.addAddress(payload.address).catch(() => {});
      }
      orderStore.place({
        id: row.id,
        items: totals.items.map((it) => ({
          product: {
            id: it.lineId,
            slug: it.lineId,
            name: it.name,
            category_slug: "food",
            image: it.image,
            weight: it.restaurantName,
            price: it.unitPrice,
            mrp: it.unitPrice,
            eta: `${eta} min`,
            rating: 4.5,
            in_stock: true,
          },
          qty: it.qty,
        })),
        address,
        payment,
        subtotal: totals.subtotal,
        delivery: totals.delivery,
        total: totals.total,
        placedAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
        eta: `${eta} minutes`,
      });
      foodCartStore.clear();
      void navigate({ to: "/order-success", search: { order: row.id } });
    };

    try {
      if (payment === "cod") {
        const r = (await dualApi.createOrder(payload)) as { id: string; created_at?: string };
        finalize(r);
        return;
      }

      const rp = (await dualApi.createRazorpayOrder(totals.total)) as {
        key_id: string;
        amount: number;
        currency: string;
        order_id: string;
      };
      await openRazorpayCheckout({
        key: rp.key_id,
        amount: rp.amount,
        currency: rp.currency,
        order_id: rp.order_id,
        name: "hallifresh",
        description: `Food order · ${items.length} item(s)`,
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
            const row = (await dualApi.verifyAndPlaceOrder({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              order: { ...payload, payment: payment as "upi" | "card" },
            })) as { id: string; created_at?: string };
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
    <div className="min-h-screen bg-zinc-50 pb-44" style={FONT}>
      <NativeHeader title="Food checkout" onBack={() => history.back()} />

      <div className="px-5 pt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
          <Clock className="h-3 w-3" /> Delivery in {eta}–{eta + 5} min
        </div>
      </div>

      {outlet && (
        <div className="mx-5 mt-3 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2.5 shadow-sm">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50">
            <Store className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold text-zinc-900">Cooking at {outlet.name}</div>
            <div className="truncate text-[10px] font-semibold text-zinc-500">
              {outlet.area ?? ""}
              {outlet.pincode ? ` · ${outlet.pincode}` : ""}
            </div>
          </div>
        </div>
      )}

      <Section title="Delivery address" icon={<MapPin className="h-4 w-4" style={{ color: GREEN }} />}>
        {savedAddrs.length > 0 && !addingNew && (
          <div className="space-y-2">
            {savedAddrs.map((a) => {
              const active = pickedSavedId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    setPickedSavedId(a.id);
                    setAddress({
                      fullName: a.full_name,
                      phone: a.phone,
                      line1: a.line1,
                      line2: a.line2 ?? "",
                      city: a.city,
                      pincode: a.pincode,
                      type: (a.type as Address["type"]) ?? "Home",
                    });
                    setSaveAddr(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                    active ? "border-emerald-500 bg-emerald-50/60" : "border-zinc-100 bg-white"
                  }`}
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100">
                    {a.type === "Work" ? (
                      <Briefcase className="h-4 w-4 text-zinc-600" />
                    ) : (
                      <HomeIcon className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                      {a.full_name}
                      <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-500">
                        {a.type}
                      </span>
                      {a.is_default && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-[11px] font-semibold text-zinc-500">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}
                    </div>
                  </div>
                  {active && <Check className="h-4 w-4 text-emerald-600" />}
                </button>
              );
            })}

            <button
              onClick={() => {
                setAddingNew(true);
                setPickedSavedId(null);
                setAddress(emptyAddress);
                setSaveAddr(true);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-zinc-300 bg-white py-3 text-xs font-extrabold text-zinc-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add new address
            </button>
          </div>
        )}

        {(savedAddrs.length === 0 || addingNew) && (
          <div className="space-y-2.5">
            {addingNew && (
              <button
                onClick={() => setAddingNew(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500"
              >
                <ChevronLeft className="h-3 w-3" /> Use saved address
              </button>
            )}
            <AddressForm address={address} setAddress={setAddress} />
            <label className="mt-1 flex items-center gap-2 text-[11px] font-bold text-zinc-600">
              <input
                type="checkbox"
                checked={saveAddr}
                onChange={(e) => setSaveAddr(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Save this address for next time
            </label>
          </div>
        )}
      </Section>

      <Section title="Payment method" icon={<Wallet className="h-4 w-4" style={{ color: GREEN }} />}>
        <div className="space-y-2">
          <PayOption
            active={payment === "upi"}
            onClick={() => setPayment("upi")}
            icon={<Smartphone className="h-4 w-4" />}
            label="UPI"
            desc="GPay, PhonePe, Paytm and more"
          />
          <PayOption
            active={payment === "card"}
            onClick={() => setPayment("card")}
            icon={<CreditCard className="h-4 w-4" />}
            label="Credit / Debit card"
            desc="Visa, Mastercard, RuPay"
          />
          <PayOption
            active={payment === "cod"}
            onClick={() => setPayment("cod")}
            icon={<Wallet className="h-4 w-4" />}
            label="Cash on delivery"
            desc="Pay in cash when your order arrives"
          />
        </div>
      </Section>

      <Section title="Order summary" icon={<TagIcon className="h-4 w-4" style={{ color: GREEN }} />}>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
          {totals.items[0]?.restaurantName}
        </div>
        <ul className="space-y-2.5">
          {totals.items.map((it) => (
            <li key={it.lineId} className="flex items-center gap-3">
              <img src={it.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="line-clamp-1 text-xs font-extrabold text-zinc-900">{it.name}</div>
                <div className="text-[11px] font-semibold text-zinc-400">Qty {it.qty}</div>
              </div>
              <div className="text-xs font-black text-zinc-900">₹{it.unitPrice * it.qty}</div>
            </li>
          ))}
        </ul>
        <div className="my-3 border-t border-dashed border-zinc-200" />
        <div className="space-y-1.5">
          <Row label="Subtotal" value={`₹${totals.subtotal}`} />
          {discount > 0 && coupon && (
            <Row label={`Coupon · ${coupon.code}`} value={`−₹${discount}`} positive />
          )}
          <Row
            label={totals.delivery === 0 ? "Delivery (FREE)" : "Delivery"}
            value={totals.delivery === 0 ? "Free" : `₹${totals.delivery}`}
          />
          <Row label="Packaging" value={`₹${totals.packaging}`} />
          <Row label="Taxes" value={`₹${totals.taxes}`} />
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-sm font-extrabold text-zinc-900">To pay</span>
          <span className="font-display text-xl font-black text-zinc-900">₹{totals.total}</span>
        </div>
        {coupon ? (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2.5">
            <div className="text-[11px] font-extrabold text-emerald-700">
              {coupon.code} applied — you saved ₹{discount}
            </div>
            <Link
              to="/food/cart"
              className="grid h-7 w-7 place-items-center rounded-full bg-white text-emerald-700"
              aria-label="Remove coupon"
            >
              <X className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <Link
            to="/food/cart"
            className="mt-3 flex items-center justify-between rounded-2xl bg-zinc-100 px-3 py-2.5 text-[11px] font-extrabold text-zinc-700"
          >
            <span className="inline-flex items-center gap-1.5">
              <TagIcon className="h-3.5 w-3.5" /> Have a coupon? Apply in cart
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </Section>

      <div className="mx-5 mt-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-[11px] font-semibold text-zinc-500 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Secured payments · Hot meals delivered fast
      </div>

      <div className="fixed inset-x-0 bottom-6 z-40 px-5" style={FONT}>
        <button
          onClick={placeOrder}
          disabled={!canPlace}
          className="flex w-full items-center justify-between rounded-[2rem] bg-[oklch(0.55_0.16_145)] px-6 py-4 text-white shadow-xl shadow-emerald-200 transition disabled:opacity-50"
        >
          <span className="text-sm font-extrabold">
            {submitting ? "Placing order…" : payment === "cod" ? "Place order" : `Pay ₹${totals.total}`}
          </span>
          <span className="font-display text-lg font-black">₹{totals.total}</span>
        </button>
        {!addressValid && (
          <p className="mt-2 text-center text-[10px] font-bold text-zinc-500">
            Complete your delivery address to continue
          </p>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 px-5">
      <div className="rounded-[1.5rem] border border-zinc-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-extrabold text-zinc-900">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function PayOption({
  active,
  onClick,
  icon,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
        active ? "border-emerald-500 bg-emerald-50/60" : "border-zinc-100 bg-white"
      }`}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-xl ${
          active ? "bg-[oklch(0.55_0.16_145)] text-white" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-extrabold text-zinc-900">{label}</div>
        <div className="text-[11px] font-semibold text-zinc-400">{desc}</div>
      </div>
      <div
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
          active ? "border-emerald-500" : "border-zinc-300"
        }`}
      >
        {active && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
      </div>
    </button>
  );
}

function AddressForm({
  address,
  setAddress,
}: {
  address: Address;
  setAddress: (a: Address) => void;
}) {
  const set = <K extends keyof Address>(k: K, v: Address[K]) =>
    setAddress({ ...address, [k]: v });

  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label="Full name" full>
        <input
          value={address.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Jane Doe"
          className={input}
        />
      </Field>
      <Field label="Phone" full>
        <input
          value={address.phone}
          inputMode="numeric"
          onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10-digit number"
          className={input}
        />
      </Field>
      <Field label="Address line 1" full>
        <input
          value={address.line1}
          onChange={(e) => set("line1", e.target.value)}
          placeholder="Flat / House no, Building"
          className={input}
        />
      </Field>
      <Field label="Address line 2 (optional)" full>
        <input
          value={address.line2 ?? ""}
          onChange={(e) => set("line2", e.target.value)}
          placeholder="Street, Area, Landmark"
          className={input}
        />
      </Field>
      <Field label="City">
        <input
          value={address.city}
          onChange={(e) => set("city", e.target.value)}
          placeholder="Bangalore"
          className={input}
        />
      </Field>
      <Field label="Pincode">
        <input
          value={address.pincode}
          inputMode="numeric"
          onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="560001"
          className={input}
        />
      </Field>

      <div className="col-span-2 mt-1">
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
          Save as
        </div>
        <div className="flex gap-2">
          {(["Home", "Work", "Other"] as const).map((t) => {
            const active = address.type === t;
            return (
              <button
                key={t}
                onClick={() => set("type", t)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl border py-2 text-xs font-extrabold transition ${
                  active
                    ? "border-emerald-500 bg-emerald-50/60 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600"
                }`}
              >
                {t === "Work" ? <Briefcase className="h-3.5 w-3.5" /> : <HomeIcon className="h-3.5 w-3.5" />}
                {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      {children}
    </label>
  );
}

const input =
  "w-full rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30";

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold text-zinc-500">{label}</span>
      <span className={`font-extrabold ${positive ? "text-emerald-600" : "text-zinc-800"}`}>
        {value}
      </span>
    </div>
  );
}

function NativeHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pb-3 pt-10 backdrop-blur-xl"
      style={FONT}
    >
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
