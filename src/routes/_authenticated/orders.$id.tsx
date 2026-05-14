import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getOrder } from "@/lib/account.functions";
import { cartStore } from "@/lib/cart-store";
import { ArrowLeft, CheckCircle2, Circle, Loader2, MapPin, Package, Repeat, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog-types";

type OrderItem = { product: Product; qty: number };

const STATUS_STEPS = [
  { id: "placed", label: "Order placed", icon: CheckCircle2 },
  { id: "packed", label: "Packed", icon: Package },
  { id: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — freshcart" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fetchOrder = useServerFn(getOrder);
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  const items = ((order?.items as unknown as OrderItem[]) ?? []);
  const address = order?.address as unknown as {
    full_name: string; phone: string; line1: string; line2?: string | null; city: string; pincode: string; type: string;
  } | undefined;

  const currentStep = STATUS_STEPS.findIndex((s) => s.id === order?.status);
  const activeIndex = currentStep === -1 ? 0 : currentStep;

  const handleReorder = () => {
    items.forEach((it) => {
      for (let i = 0; i < it.qty; i++) cartStore.add(it.product);
    });
    toast.success("Items added to cart");
    navigate({ to: "/cart" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
        </Link>

        {isLoading ? (
          <div className="grid h-40 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : !order ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-card">
            <h2 className="font-display text-lg font-bold">Order not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">This order doesn't exist or isn't yours.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">Order #{order.id.slice(0, 8)}</h1>
                <div className="mt-1 text-xs text-muted-foreground">
                  Placed {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={handleReorder}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop hover:opacity-95"
              >
                <Repeat className="h-3.5 w-3.5" /> Reorder
              </button>
            </div>

            {/* Status timeline */}
            <div className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tracking</div>
              <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= activeIndex;
                  const Icon = done ? step.icon : Circle;
                  return (
                    <li key={step.id} className="relative flex flex-col items-center text-center">
                      <div
                        className={`grid h-9 w-9 place-items-center rounded-full ${
                          done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className={`mt-2 text-[11px] font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
              {/* Items */}
              <div className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </div>
                <ul className="mt-3 divide-y">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                      {it.product.image && (
                        <img src={it.product.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-sm font-semibold">{it.product.name}</div>
                        <div className="text-xs text-muted-foreground">{it.product.weight} · Qty {it.qty}</div>
                      </div>
                      <div className="text-sm font-bold">₹{it.product.price * it.qty}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary + address */}
              <div className="space-y-5">
                <div className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Summary</div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row label="Subtotal" value={`₹${order.subtotal}`} />
                    <Row label="Delivery" value={order.delivery > 0 ? `₹${order.delivery}` : "Free"} />
                    <Row label="Payment" value={(order.payment ?? "").toUpperCase()} />
                    <div className="my-2 border-t" />
                    <Row label="Total" value={`₹${order.total}`} bold />
                  </dl>
                </div>

                {address && (
                  <div className="rounded-2xl border bg-card p-5 shadow-card">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery to</div>
                    </div>
                    <div className="mt-3 text-sm font-bold">{address.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city} — {address.pincode}
                    </div>
                    <div className="text-xs text-muted-foreground">+91 {address.phone}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : ""}`}>
      <dt className={bold ? "" : "text-muted-foreground"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
