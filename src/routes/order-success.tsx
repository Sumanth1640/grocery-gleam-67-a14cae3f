import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useLastOrder } from "@/lib/order-store";
import { CheckCircle2, Clock, MapPin, Package, Receipt } from "lucide-react";

export const Route = createFileRoute("/order-success")({
  head: () => ({ meta: [{ title: "Order placed — hallifresh" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const order = useLastOrder();

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">No recent order</h1>
          <p className="mt-2 text-sm text-muted-foreground">Looks like you haven't placed an order yet.</p>
          <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Start shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const payLabel =
    order.payment === "upi" ? "UPI" : order.payment === "card" ? "Credit / Debit card" : "Cash on delivery";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="grid place-items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold">Order placed!</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Thanks {order.address.fullName.split(" ")[0]}, we're packing your groceries now.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-brand-foreground">
            <Clock className="h-4 w-4" /> Arriving in {order.eta}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card icon={Receipt} title="Order details">
            <div className="text-sm font-semibold">#{order.id}</div>
            <div className="text-xs text-muted-foreground">
              Placed {new Date(order.placedAt).toLocaleString()}
            </div>
            <div className="mt-2 text-xs">
              <span className="text-muted-foreground">Payment:</span>{" "}
              <span className="font-semibold">{payLabel}</span>
            </div>
          </Card>

          <Card icon={MapPin} title="Delivery address">
            <div className="text-sm font-semibold">{order.address.fullName}</div>
            <div className="text-xs text-muted-foreground">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city} — {order.address.pincode}
            </div>
            <div className="text-xs text-muted-foreground">+91 {order.address.phone}</div>
          </Card>
        </div>

        <div className="mt-4 rounded-2xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-bold">{order.items.reduce((s, i) => s + i.qty, 0)} items</h3>
          </div>
          <ul className="mt-3 divide-y">
            {order.items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <img src={product.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.weight} · Qty {qty}</div>
                </div>
                <div className="text-sm font-bold">₹{product.price * qty}</div>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t pt-4">
            <div className="font-display font-bold">Total paid</div>
            <div className="font-display text-xl font-extrabold">₹{order.total}</div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Continue shopping
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Clock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
