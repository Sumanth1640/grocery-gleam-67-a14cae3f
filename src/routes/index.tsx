import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { cartStore, useCart, cartTotals } from "@/lib/cart-store";
import { MapPin, Search, SlidersHorizontal, ShoppingBasket, Plus } from "lucide-react";
import type { Product } from "@/lib/catalog-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "hallifresh — Groceries delivered fast" },
      { name: "description", content: "Order fresh groceries in the easiest way. Fruits, dairy, bakery & more — delivered fast." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const cats = useServerFn(listCategories);
  const prods = useServerFn(listProducts);
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => cats() });
  const prodsQ = useQuery({ queryKey: ["products"], queryFn: () => prods() });
  const cart = useCart();
  const { itemsCount } = cartTotals(cart);

  const categories = catsQ.data ?? [];
  const products = prodsQ.data ?? [];
  const popular = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-6">
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> Delivery to
            </div>
            <div className="mt-0.5 font-display text-base font-extrabold">Dhaka, Bangladesh</div>
          </div>
          <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-card shadow-card ring-1 ring-border">
            <ShoppingBasket className="h-[18px] w-[18px]" />
            {itemsCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-cta px-1 text-[10px] font-bold text-cta-foreground">
                {itemsCount}
              </span>
            )}
          </Link>
        </div>

        {/* Headline */}
        <h1 className="mt-5 font-display text-[28px] font-extrabold leading-[1.15] tracking-tight">
          Buy <span className="text-brand">Groceries</span> in a most easiest way.
        </h1>

        {/* Search */}
        <Link to="/search" className="mt-5 flex items-stretch gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search your products</span>
          </div>
          <div className="grid h-[46px] w-[46px] place-items-center rounded-2xl bg-cta text-cta-foreground shadow-pop">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </Link>

        {/* Category pills */}
        <div className="-mx-5 mt-5 flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
          {(catsQ.isLoading ? Array.from({ length: 4 }) : categories).map((c: any, i) => (
            <Link
              key={c?.slug ?? i}
              to={c ? "/c/$slug" : "/"}
              params={c ? { slug: c.slug } : undefined as any}
              className="flex shrink-0 items-center gap-2 rounded-full bg-card py-2 pl-2 pr-4 ring-1 ring-border"
            >
              <span
                className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-muted"
                style={c?.tint ? { backgroundColor: c.tint } : undefined}
              >
                {c?.image && (
                  <img src={c.image} alt="" className="h-8 w-8 object-cover" loading="lazy" />
                )}
              </span>
              <span className="text-sm font-bold">{c?.name ?? "…"}</span>
            </Link>
          ))}
        </div>

        {/* Promo banner */}
        <div className="mt-5 overflow-hidden rounded-[1.4rem] bg-[oklch(0.55_0.18_25)] text-white">
          <div className="flex items-center justify-between gap-3 p-5">
            <div className="min-w-0">
              <div className="text-xs font-semibold opacity-90">Hurry Up! Get 20% Off</div>
              <div className="mt-1 font-display text-[19px] font-extrabold leading-tight">
                Fresh food everyday<br />from focofresh
              </div>
              <button className="mt-3 rounded-full bg-white px-5 py-2 text-xs font-bold text-[oklch(0.55_0.18_25)]">
                Shop Now
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=70"
              alt=""
              className="h-28 w-28 shrink-0 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Popular */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">Popular</h2>
          <Link to="/categories" className="text-xs font-semibold text-muted-foreground">View all</Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-4">
          {(prodsQ.isLoading ? Array.from({ length: 4 }) : popular).map((p: any, i) => (
            <PopularCard key={p?.id ?? i} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PopularCard({ product }: { product?: Product }) {
  if (!product) {
    return <div className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />;
  }
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const badge = off > 0 ? { text: `${off}% OFF`, bg: "bg-[oklch(0.55_0.22_28)]" } : { text: "Best sale", bg: "bg-[oklch(0.32_0.12_270)]" };
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <span className={`absolute left-0 top-0 z-10 rounded-br-lg ${badge.bg} px-2 py-1 text-[10px] font-bold leading-tight text-white`}>
        {badge.text}
      </span>
      <Link to="/p/$id" params={{ id: product.slug }} className="block bg-muted/40 p-3">
        <img src={product.image} alt={product.name} className="mx-auto h-32 w-full object-contain" loading="lazy" />
      </Link>
      <div className="px-3 pb-3 pt-2">
        <Link to="/p/$id" params={{ id: product.slug }} className="line-clamp-1 text-sm font-extrabold">
          {product.name}
        </Link>
        <div className="text-xs text-muted-foreground">{product.weight}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-extrabold text-primary">${product.price}</div>
          <button
            onClick={() => cartStore.add(product)}
            aria-label="Add to cart"
            className="grid h-8 w-8 place-items-center rounded-full bg-cta text-cta-foreground shadow-pop"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
