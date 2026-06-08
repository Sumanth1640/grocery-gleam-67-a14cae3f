import { Link } from "@tanstack/react-router";
import type { Order } from "@/lib/order-store";
import { CheckCircle2, ChevronRight, Clock, MapPin, Package, Receipt } from "lucide-react";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

export function MobileOrderSuccess({ order }: { order: Order }) {
  const payLabel =
    order.payment === "upi" ? "UPI" : order.payment === "card" ? "Card" : "Cash on delivery";
  const firstName = (order.address.fullName || "Customer").split(" ")[0];

  return (
    <div className="min-h-screen bg-white pb-12" style={FONT}>
      <div
        className="px-6 pt-16 pb-10 text-center text-white"
        style={{
          background: `linear-gradient(160deg, ${GREEN} 0%, oklch(0.5 0.18 155) 100%)`,
        }}
      >
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/15 ring-4 ring-white/20 backdrop-blur">
          <CheckCircle2 className="h-10 w-10" strokeWidth={2.4} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">Order placed!</h1>
        <p className="mt-2 text-sm text-white/85">
          Thanks {firstName}, we're preparing your order now.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-zinc-900">
          <Clock className="h-3.5 w-3.5" /> Arriving in {order.eta}
        </div>
      </div>

      <div className="-mt-6 px-5 space-y-3">
        <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-zinc-100">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="text-sm font-extrabold text-zinc-900">Order details</div>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            <div>#{order.id.slice(0, 12)}</div>
            <div>Placed {new Date(order.placedAt).toLocaleString()}</div>
            <div className="mt-1">
              Payment: <span className="font-bold text-zinc-900">{payLabel}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-zinc-100">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="text-sm font-extrabold text-zinc-900">Delivery address</div>
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            <div className="font-bold text-zinc-900">{order.address.fullName}</div>
            <div>
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city} — {order.address.pincode}
            </div>
            <div>+91 {order.address.phone}</div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-zinc-100">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
              <Package className="h-4 w-4" />
            </div>
            <div className="text-sm font-extrabold text-zinc-900">
              {order.items.reduce((s, i) => s + i.qty, 0)} items
            </div>
          </div>
          <ul className="mt-3 divide-y divide-zinc-100">
            {order.items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 py-2.5">
                {product.image && (
                  <img src={product.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs font-bold text-zinc-900">{product.name}</div>
                  <div className="text-[10px] text-zinc-500">
                    {product.weight} · Qty {qty}
                  </div>
                </div>
                <div className="text-xs font-extrabold text-zinc-900">₹{product.price * qty}</div>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-3">
            <div className="text-sm font-bold text-zinc-700">Total paid</div>
            <div className="text-xl font-extrabold text-zinc-900">₹{order.total}</div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            to="/orders/$id"
            params={{ id: order.id }}
            className="flex w-full items-center justify-between rounded-2xl bg-zinc-900 px-5 py-4 text-sm font-bold text-white"
          >
            Track order
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="block w-full rounded-2xl bg-zinc-100 px-5 py-4 text-center text-sm font-bold text-zinc-900"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
