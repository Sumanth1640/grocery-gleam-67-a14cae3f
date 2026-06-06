import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { dualApi } from "@/lib/dual-api";
import { CheckCircle2, Clock, MapPin, Package, Receipt, Truck } from "lucide-react";

const searchSchema = z.object({ order: z.string().uuid().optional() });

type DbOrder = {
  id: string;
  items: unknown;
  address: unknown;
  payment: string;
  subtotal: number;
  delivery: number;
  total: number;
  created_at: string;
};

type DbAddress = {
  full_name?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  pincode?: string;
  type?: string;
};

type OrderItem = {
  product: {
    id: string;
    name: string;
    weight?: string;
    price: number;
    image?: string;
  };
  qty: number;
};

function normalizeDbOrder(row: unknown): {
  id: string;
  items: OrderItem[];
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    pincode: string;
    type: string;
  };
  payment: "upi" | "card" | "cod";
  subtotal: number;
  delivery: number;
  total: number;
  placedAt: number;
} {
  const r = row as DbOrder;
  const address = (r.address ?? {}) as DbAddress;
  const rawItems = Array.isArray(r.items) ? (r.items as OrderItem[]) : [];
  return {
    id: r.id,
    items: rawItems,
    address: {
      fullName: address.full_name ?? "Customer",
      phone: address.phone ?? "",
      line1: address.line1 ?? "",
      line2: address.line2 ?? "",
      city: address.city ?? "",
      pincode: address.pincode ?? "",
      type: address.type ?? "Home",
    },
    payment: r.payment === "card" ? "card" : r.payment === "cod" ? "cod" : "upi",
    subtotal: r.subtotal,
    delivery: r.delivery,
    total: r.total,
    placedAt: new Date(r.created_at).getTime(),
  };
}

export const Route = createFileRoute("/furniture/order-success")({
  head: () => ({ meta: [{ title: "Order confirmed — Wooden Furniture" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: FurnitureOrderSuccessPage,
});

function FurnitureOrderSuccessPage() {
  const search = Route.useSearch();
  const orderId = search.order;

  const orderQ = useQuery({
    queryKey: ["furniture-order-success", orderId],
    queryFn: () => (orderId ? dualApi.getOrder(orderId) : Promise.reject(new Error("No order ID"))),
    enabled: !!orderId,
    retry: false,
  });

  const order = orderQ.data ? normalizeDbOrder(orderQ.data) : null;

  if (orderQ.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h1 className="mt-5 font-display text-2xl font-bold">Confirming your order…</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please wait while we load your order details.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-bold">No order found</h1>
          <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t find an order to display.</p>
          <Link to="/furniture" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Browse furniture
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const payLabel =
    order.payment === "upi" ? "UPI" : order.payment === "card" ? "Credit / Debit card" : "Cash on delivery";

  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="grid place-items-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2.2} />
          </div>
          <h1 className="mt-5 font-display text-3xl font-extrabold">Order confirmed!</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Thank you {order.address.fullName.split(" ")[0]}, your furniture order has been placed.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-brand-foreground">
            <Truck className="h-4 w-4" /> White-glove delivery in 7–14 days
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
            <div className="mt-1 text-xs">
              <span className="text-muted-foreground">Delivery:</span>{" "}
              <span className="font-semibold">White-glove (carry-in + assembly)</span>
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
            <h3 className="font-display text-lg font-bold">{itemCount} item{itemCount !== 1 ? "s" : ""}</h3>
          </div>
          <ul className="mt-3 divide-y">
            {order.items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <img
                  src={product.image ?? "/placeholder.svg"}
                  alt={product.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-semibold">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {product.weight ?? "Solid wood"} · Qty {qty}
                  </div>
                </div>
                <div className="text-sm font-bold">₹{(product.price * qty).toLocaleString("en-IN")}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold">₹{order.subtotal.toLocaleString("en-IN")}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">White-glove delivery</dt>
              <dd className="font-semibold">₹{order.delivery.toLocaleString("en-IN")}</dd>
            </div>
            <div className="flex items-center justify-between border-t pt-2">
              <dt className="font-display font-bold">Total paid</dt>
              <dd className="font-display text-xl font-extrabold">₹{order.total.toLocaleString("en-IN")}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/furniture" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Continue shopping
          </Link>
          <Link
            to="/orders/$id"
            params={{ id: order.id }}
            className="rounded-xl border px-6 py-3 text-sm font-bold hover:bg-secondary"
          >
            Track order
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
