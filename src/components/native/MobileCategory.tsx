import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronLeft, Search, ShoppingBag, SlidersHorizontal, Plus, ChevronRight } from "lucide-react";
import { listCategories, productsByCategory } from "@/lib/catalog.functions";
import { cartStore, useCart, cartTotals } from "@/lib/cart-store";

/** Reference-style mobile Product List screen for /c/$slug. */
export function MobileCategory({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const cats = useServerFn(listCategories);
  const byCat = useServerFn(productsByCategory);
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => cats() });
  const itemsQ = useQuery({
    queryKey: ["products", "by-cat", slug],
    queryFn: () => byCat({ data: { slug } }),
  });
  const cart = useCart();
  const { itemsCount } = cartTotals(cart);
  const [q, setQ] = useState("");

  const categories = (catsQ.data ?? []).slice(0, 8);
  const products = itemsQ.data ?? [];
  const popular = products.slice(0, 6);
  const newArrivals = products.slice(6, 12);

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.005_145)] pb-32">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-6">
        <button
          onClick={() => history.back()}
          aria-label="Back"
          className="grid h-11 w-11 place-items-center rounded-full bg-card shadow-card"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-base font-extrabold">Product List</h1>
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

      {/* Search + filter */}
      <form
        className="mt-5 flex items-center gap-2 px-5"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/search", search: { q } });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search your products"
            className="h-12 w-full rounded-2xl bg-card pl-11 pr-4 text-sm font-medium shadow-card outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          aria-label="Filter"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-[oklch(0.7_0.2_45)] text-white shadow-pop"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </form>

      {/* Category chips — active chip highlighted */}
      <div className="mt-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c: any) => {
          const active = c.slug === slug;
          return (
            <Link
              key={c.slug}
              to="/c/$slug"
              params={{ slug: c.slug }}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 shadow-card transition ${
                active ? "bg-[oklch(0.22_0.06_160)] text-white" : "bg-card"
              }`}
            >
              <img src={c.image} alt="" className="h-7 w-7 rounded-full object-cover" />
              <span className="pr-2 text-sm font-bold">{c.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Popular */}
      <div className="mt-7 flex items-end justify-between px-5">
        <h2 className="font-display text-xl font-extrabold">Popular</h2>
        <button className="inline-flex items-center text-xs font-semibold text-muted-foreground">
          View all <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 px-5">
        {(itemsQ.isLoading ? Array.from({ length: 4 }) : popular).map((p: any, i) => (
          <MobileProductCard key={p?.id ?? i} product={p} />
        ))}
      </div>

      {/* Promo banner */}
      {popular[0] && (
        <div className="mt-7 px-5">
          <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl bg-[oklch(0.5_0.22_25)] p-5 text-white shadow-pop">
            <div className="relative z-10 max-w-[60%]">
              <div className="text-[11px] font-semibold opacity-90">Hurry Up! Get 20% Off</div>
              <div className="mt-1 font-display text-lg font-extrabold leading-tight">
                Fresh food everyday from HalliFresh
              </div>
              <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold text-foreground">
                Shop Now
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1546470427-227dbb7c1d2c?auto=format&fit=crop&w=400&q=70"
              alt=""
              className="pointer-events-none absolute -right-4 bottom-0 top-0 my-auto h-32 w-32 rounded-full object-cover opacity-95"
            />
          </div>
        </div>
      )}

      {/* New arrival */}
      {newArrivals.length > 0 && (
        <>
          <div className="mt-7 flex items-end justify-between px-5">
            <h2 className="font-display text-xl font-extrabold">New arrival</h2>
            <button className="inline-flex items-center text-xs font-semibold text-muted-foreground">
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 px-5">
            {newArrivals.map((p: any) => (
              <MobileProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MobileProductCard({ product }: { product: any }) {
  if (!product) {
    return (
      <div className="rounded-3xl bg-card p-3 shadow-card">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
        <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    );
  }
  const off =
    product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="relative flex flex-col rounded-3xl bg-card p-3 shadow-card">
      <div className="absolute left-3 top-3 z-10">
        {off > 0 ? (
          <ShieldBadge color="oklch(0.55 0.22 25)" label={`${off}%`} sub="OFF" />
        ) : (
          <ShieldBadge color="oklch(0.45 0.18 260)" label="Best" sub="sale" />
        )}
      </div>
      <Link
        to="/p/$id"
        params={{ id: product.slug }}
        className="block aspect-square overflow-hidden rounded-2xl bg-[oklch(0.97_0.01_145)]"
      >
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
      </Link>
      <Link to="/p/$id" params={{ id: product.slug }} className="mt-3 line-clamp-1 text-sm font-bold">
        {product.name}
      </Link>
      <div className="text-[11px] text-muted-foreground">{product.weight}</div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-base font-extrabold">₹{product.price}</div>
          {off > 0 && (
            <div className="text-[11px] text-muted-foreground line-through">₹{product.mrp}</div>
          )}
        </div>
        <button
          onClick={() => cartStore.add(product)}
          aria-label="Add to cart"
          className="grid h-9 w-9 place-items-center rounded-full bg-[oklch(0.7_0.2_45)] text-white shadow-pop transition active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function ShieldBadge({ color, label, sub }: { color: string; label: string; sub: string }) {
  return (
    <div
      className="grid h-11 w-9 place-items-center text-center text-white shadow-pop"
      style={{
        background: color,
        clipPath: "polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)",
      }}
    >
      <div className="-mt-1 leading-none">
        <div className="text-[10px] font-extrabold">{label}</div>
        <div className="text-[8px] font-semibold uppercase opacity-90">{sub}</div>
      </div>
    </div>
  );
}
