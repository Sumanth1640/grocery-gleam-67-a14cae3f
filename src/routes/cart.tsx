import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cartStore, cartTotals, useCart } from "@/lib/cart-store";
import { Minus, Plus, Trash2, ShoppingBag, Clock } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — freshcart" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { items, itemsCount, subtotal, savings, delivery, total } = cartTotals(cart);

  if (itemsCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-secondary">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add fresh groceries and they'll show up here.</p>
          <Link to="/" className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Start shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">My cart</h1>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
          <Clock className="h-3.5 w-3.5" /> Delivery in 11 minutes
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-4 rounded-2xl border bg-card p-3 shadow-card">
                <img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <Link to="/p/$id" params={{ id: product.id }} className="line-clamp-2 text-sm font-semibold">
                    {product.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">{product.weight}</div>
                  <div className="mt-1 text-sm font-bold">
                    ₹{product.price * qty}{" "}
                    {product.mrp > product.price && (
                      <span className="ml-1 text-xs font-medium text-muted-foreground line-through">
                        ₹{product.mrp * qty}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground">
                  <button onClick={() => cartStore.remove(product.id)} className="grid h-8 w-8 place-items-center">
                    {qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                  </button>
                  <span className="min-w-5 text-center text-xs font-bold">{qty}</span>
                  <button onClick={() => cartStore.add(product)} className="grid h-8 w-8 place-items-center">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border bg-card p-5 shadow-card md:sticky md:top-20">
            <h3 className="font-display text-lg font-bold">Bill details</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Item subtotal" value={`₹${subtotal}`} />
              {savings > 0 && <Row label="Product savings" value={`- ₹${savings}`} positive />}
              <Row label={delivery > 0 ? "Delivery fee" : "Delivery"} value={delivery > 0 ? `₹${delivery}` : "FREE"} positive={delivery === 0} />
              {delivery > 0 && (
                <p className="rounded-md bg-accent/60 p-2 text-[11px] text-muted-foreground">
                  Add ₹{199 - subtotal} more for free delivery
                </p>
              )}
            </dl>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="font-display text-lg font-bold">To pay</div>
              <div className="font-display text-xl font-extrabold">₹{total}</div>
            </div>
            <button className="mt-5 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-pop transition hover:opacity-95">
              Proceed to checkout
            </button>
            <button onClick={() => cartStore.clear()} className="mt-2 w-full rounded-xl border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-secondary">
              Clear cart
            </button>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
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
