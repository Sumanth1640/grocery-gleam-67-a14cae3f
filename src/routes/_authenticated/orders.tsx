import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { listOrders } from "@/lib/account.functions";
import { Loader2, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Your orders — freshcart" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const fetchOrders = useServerFn(listOrders);
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => fetchOrders() });

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
                <li key={o.id} className="rounded-2xl border bg-card p-4 shadow-card">
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
