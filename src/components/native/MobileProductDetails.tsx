import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ShoppingBag, Heart, Minus, Plus, Truck, Leaf, ShieldCheck } from "lucide-react";
import { dualApi } from "@/lib/dual-api";
import { cartStore, useCart, cartTotals } from "@/lib/cart-store";
import { wishlistStore, useWishlist } from "@/lib/wishlist-store";
import type { Product } from "@/lib/catalog-types";

/** Reference-style mobile Product Details screen. */
export function MobileProductDetails({ product }: { product: Product }) {
  const navigate = useNavigate();
  const cart = useCart();
  const wishlist = useWishlist();
  const { itemsCount } = cartTotals(cart);
  const qty = cart[product.id]?.qty ?? 0;
  const wished = !!wishlist[product.id];
  const [localQty, setLocalQty] = useState(Math.max(qty, 0));

  const relatedQ = useQuery({
    queryKey: ["products", "by-cat", product.category_slug],
    queryFn: () => dualApi.productsByCategory(product.category_slug),
  });
  const related = (relatedQ.data ?? []).filter((p) => p.id !== product.id).slice(0, 4);

  const addToCart = () => {
    const target = Math.max(localQty, 1);
    const diff = target - qty;
    if (diff > 0) for (let i = 0; i < diff; i++) cartStore.add(product);
    else if (diff < 0) for (let i = 0; i < -diff; i++) cartStore.remove(product.id);
    setLocalQty(target);
    navigate({ to: "/cart" });
  };

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.005_145)] pb-28">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          onClick={() => history.back()}
          aria-label="Back"
          className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-base font-extrabold">Product Details</h1>
        <Link
          to="/cart"
          aria-label="Cart"
          className="relative grid h-11 w-11 place-items-center rounded-full bg-card shadow-card"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemsCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {itemsCount}
            </span>
          )}
        </Link>
      </header>

      {/* Hero image */}
      <div className="mt-5 px-5">
        <div className="relative aspect-[5/3] overflow-hidden rounded-3xl bg-[oklch(0.92_0.07_145)]">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Title card */}
      <div className="mt-5 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold">{product.name}</h2>
              <div className="text-sm text-muted-foreground">{product.weight}</div>
            </div>
            <button
              onClick={() => wishlistStore.toggle(product)}
              aria-label="Save"
              className={`grid h-10 w-10 place-items-center rounded-full bg-secondary ${
                wished ? "text-[oklch(0.55_0.22_25)]" : ""
              }`}
            >
              <Heart className={`h-5 w-5 ${wished ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="font-display text-2xl font-extrabold text-primary">₹{product.price}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.92_0.06_240)] text-[oklch(0.45_0.18_240)]">
                <Truck className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold text-muted-foreground">Available on fast delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perks */}
      <div className="mt-4 grid grid-cols-2 gap-3 px-5">
        <Perk
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Halal Food"
          tint="oklch(0.92 0.06 35)"
          fg="oklch(0.55 0.22 25)"
        />
        <Perk
          icon={<Leaf className="h-4 w-4" />}
          label="Fresh Fruit"
          tint="oklch(0.92 0.08 145)"
          fg="oklch(0.45 0.18 145)"
        />
      </div>

      {/* Description */}
      <div className="mt-4 px-5">
        <div className="rounded-3xl bg-card p-5 shadow-card">
          <h3 className="font-display text-base font-extrabold">Description</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            100% satisfaction guarantee. If you experience any of the following issues — missing item,
            poor quality, late arrival or unprofessional service —{" "}
            <span className="font-bold text-foreground">Read more</span>
          </p>
        </div>
      </div>

      {/* Want to add more */}
      {related.length > 0 && (
        <div className="mt-4 px-5">
          <div className="rounded-3xl bg-[oklch(0.94_0.04_180)] p-5">
            <h3 className="font-display text-base font-extrabold">Want to Add more items?</h3>
            <ul className="mt-4 space-y-3">
              {related.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card"
                >
                  <Link
                    to="/p/$id"
                    params={{ id: p.slug }}
                    className="block h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[oklch(0.97_0.01_145)]"
                  >
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-bold">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.weight}</div>
                    <div className="mt-1 text-sm font-extrabold text-primary">₹{p.price}</div>
                  </div>
                  <button
                    onClick={() => cartStore.add(p)}
                    aria-label={`Add ${p.name}`}
                    className="grid h-10 w-10 place-items-center rounded-full bg-[oklch(0.7_0.2_45)] text-white shadow-pop active:scale-95"
                  >
                    <Plus className="h-4 w-4" strokeWidth={3} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card px-4 py-3 shadow-pop">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-2 py-1.5">
            <button
              onClick={() => setLocalQty((n) => Math.max(0, n - 1))}
              className="grid h-8 w-8 place-items-center rounded-full bg-card"
              aria-label="Decrease"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center text-sm font-extrabold">{localQty}</span>
            <button
              onClick={() => setLocalQty((n) => n + 1)}
              className="grid h-8 w-8 place-items-center rounded-full bg-card"
              aria-label="Increase"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={addToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[oklch(0.7_0.2_45)] py-3 text-sm font-extrabold text-white shadow-pop active:scale-[0.99]"
          >
            <ShoppingBag className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function Perk({
  icon,
  label,
  tint,
  fg,
}: {
  icon: React.ReactNode;
  label: string;
  tint: string;
  fg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
      <span
        className="grid h-9 w-9 place-items-center rounded-full"
        style={{ background: tint, color: fg }}
      >
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
