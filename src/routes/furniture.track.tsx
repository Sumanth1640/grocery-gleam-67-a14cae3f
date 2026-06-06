import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { dualApi } from "@/lib/dual-api";
import {
  CheckCircle2,
  Circle,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";

const searchSchema = z.object({ order: z.string().optional() });

const STEPS = [
  {
    id: "placed",
    label: "Order confirmed",
    desc: "We've received your order and payment.",
    icon: CheckCircle2,
  },
  {
    id: "packed",
    label: "Packed & ready",
    desc: "Your furniture is securely packed in our workshop.",
    icon: Package,
  },
  {
    id: "out_for_delivery",
    label: "Out for delivery",
    desc: "Our white-glove team is on the way.",
    icon: Truck,
  },
  {
    id: "delivered",
    label: "Delivered",
    desc: "Carry-in & assembly complete. Enjoy!",
    icon: PackageCheck,
  },
] as const;

type StatusId = (typeof STEPS)[number]["id"] | "cancelled" | string;

export const Route = createFileRoute("/furniture/track")({
  head: () => ({ meta: [{ title: "Track your order — Wooden Furniture" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: FurnitureTrackPage,
});

function FurnitureTrackPage() {
  const { order: orderId } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(orderId ?? "");

  const orderQ = useQuery({
    queryKey: ["furniture-track", orderId],
    queryFn: () =>
      orderId
        ? dualApi.getOrder(orderId)
        : Promise.reject(new Error("No order ID")),
    enabled: !!orderId,
    retry: false,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const order = orderQ.data as
    | { id: string; status?: StatusId; created_at: string; address?: unknown }
    | undefined;
  const status: StatusId = (order?.status ?? "placed") as StatusId;
  const cancelled = status === "cancelled";
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.id === status),
  );

  const address = (order?.address ?? {}) as {
    full_name?: string;
    phone?: string;
    line1?: string;
    line2?: string | null;
    city?: string;
    pincode?: string;
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = query.trim();
    if (!v) return;
    navigate({ to: "/furniture/track", search: { order: v } });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">
            Track your order
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live status updates from workshop to your living room.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-2xl border bg-card p-2 shadow-card"
        >
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your order ID"
              className="w-full bg-transparent py-2 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95"
          >
            Track
          </button>
        </form>

        {!orderId ? (
          <div className="mt-10 rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground shadow-card">
            Enter your order ID above to see live status.
          </div>
        ) : orderQ.isLoading ? (
          <div className="mt-10 grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !order ? (
          <div className="mt-10 rounded-2xl border bg-card p-10 text-center shadow-card">
            <h2 className="font-display text-lg font-bold">Order not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Double-check the ID and try again.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 shadow-card">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Order
                </div>
                <div className="font-display text-lg font-bold">
                  #{order.id.slice(0, 12)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Placed {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  cancelled
                    ? "bg-destructive/15 text-destructive"
                    : status === "delivered"
                      ? "bg-success/15 text-success"
                      : "bg-primary/15 text-primary"
                }`}
              >
                {String(status).replace(/_/g, " ")}
              </span>
            </div>

            {cancelled ? (
              <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <h3 className="font-display text-base font-bold text-destructive">
                  This order was cancelled
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Contact support if you have any questions.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-bold">Status timeline</h3>
                <ol className="mt-5 space-y-5">
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i < activeIndex;
                    const active = i === activeIndex;
                    return (
                      <li key={step.id} className="relative flex gap-4">
                        {i < STEPS.length - 1 && (
                          <span
                            aria-hidden
                            className={`absolute left-[19px] top-10 h-[calc(100%-12px)] w-0.5 ${
                              done ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <div
                          className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 ${
                            done
                              ? "border-primary bg-primary text-primary-foreground"
                              : active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : active ? (
                            <Icon className="h-5 w-5 animate-pulse" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <div
                            className={`text-sm font-bold ${
                              done || active
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {step.desc}
                          </div>
                          {active && (
                            <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                              </span>
                              Live · updating every few seconds
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {(address.line1 || address.full_name) && (
              <div className="mt-4 rounded-2xl border bg-card p-5 shadow-card">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-base font-bold">
                    Delivery address
                  </h3>
                </div>
                <div className="mt-2 text-sm font-semibold">
                  {address.full_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  {address.city ? `, ${address.city}` : ""}
                  {address.pincode ? ` — ${address.pincode}` : ""}
                </div>
                {address.phone && (
                  <div className="text-xs text-muted-foreground">
                    +91 {address.phone}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/furniture"
                className="rounded-xl border px-5 py-2.5 text-sm font-bold hover:bg-secondary"
              >
                Continue shopping
              </Link>
              <Link
                to="/furniture/order-success"
                search={{ order: order.id }}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop"
              >
                View order details
              </Link>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
