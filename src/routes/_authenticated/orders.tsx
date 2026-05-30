import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { listOrders } from "@/lib/account.functions";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, Check } from "lucide-react";


const STATUS_STEPS = ["placed", "packed", "out_for_delivery", "delivered"] as const;
type StepId = typeof STATUS_STEPS[number];
const STEP_LABELS: Record<StepId, string> = {
  placed: "Placed",
  packed: "Packed",
  out_for_delivery: "Shipped",
  delivered: "Delivered",
};

function OrderTracker({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status as StepId);
  const activeIndex = idx === -1 ? 0 : idx;
  const pct = (activeIndex / (STATUS_STEPS.length - 1)) * 100;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
        Order cancelled
      </div>
    );
  }

  return (
    <div className="mt-4 px-1 pb-1">
      <div className="relative">
        <div className="absolute left-[10%] right-[10%] top-3 h-[3px] rounded-full bg-secondary" />
        <div
          className="absolute left-[10%] top-3 h-[3px] rounded-full bg-success transition-[width] duration-1000 ease-out"
          style={{ width: `calc(${pct} * 0.8%)` }}
        />
        <ol className="relative grid grid-cols-4 gap-1">
          {STATUS_STEPS.map((s, i) => {
            const done = i <= activeIndex;
            const isCurrent = i === activeIndex && status !== "delivered";
            return (
              <li key={s} className="flex flex-col items-center text-center">
                <div
                  className={`grid h-6 w-6 place-items-center rounded-full ring-2 ring-card transition-all duration-500 ${
                    done ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"
                  } ${isCurrent ? "animate-pulse-ring" : ""}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  {done ? (
                    <Check className="h-3 w-3 animate-check-pop" strokeWidth={3} />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                  )}
                </div>
                <div className={`mt-1.5 text-[10px] font-semibold ${done ? "text-success" : "text-muted-foreground"}`}>
                  {STEP_LABELS[s]}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Your orders — hallifresh" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const fetchOrders = useDualFn(listOrders, () => php.myOrders());
  const { session, user } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const token = session?.access_token;
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
    enabled: pathname === "/orders",
  });

  useEffect(() => {
    if (!userId) return;
    // Skip Supabase realtime in PHP mode (no Supabase session token)
    if (!token) return;
    try { supabase.realtime.setAuth(token); } catch { /* ignore */ }
    const ch = supabase
      .channel(`user-orders-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${userId}` }, () => {
        qc.invalidateQueries({ queryKey: ["orders"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [userId, token, qc]);

  if (pathname !== "/orders") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold md:text-3xl">Your orders</h1>
        </div>

        {isLoading ? (
          <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : !data || data.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-card">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-3 font-display text-lg font-bold">No orders yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">When you place an order, it will show up here.</p>
            <Link to="/" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">Start shopping</Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {data.map((o: any) => {
              const items = (o.items ?? []) as { product: { name: string; image?: string }; qty: number }[];
              return (
                <li key={o.id}>
                  <Link
                    to="/orders/$id"
                    params={{ id: o.id }}
                    className="block rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">{o.status}</span>
                          <span className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                          <span className="text-xs text-muted-foreground">· {new Date(o.created_at).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-sm font-semibold">{items.length} item{items.length !== 1 ? "s" : ""}</div>
                      </div>
                      <div className="font-display text-lg font-extrabold">₹{o.total}</div>
                    </div>
                    <OrderTracker status={o.status} />
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {items.slice(0, 5).map((it, i) => (
                        it.product.image ? (
                          <img key={i} src={it.product.image} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                        ) : null
                      ))}
                      {items.length > 5 && (
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-secondary text-xs font-bold text-muted-foreground">+{items.length - 5}</div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  );
}
