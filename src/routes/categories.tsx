import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCategories, listProducts } from "@/lib/catalog.functions";
import { cartStore, useCart, cartTotals } from "@/lib/cart-store";
import type { Product } from "@/lib/catalog-types";
import { ChevronLeft, Search, SlidersHorizontal, ShoppingBasket, Plus } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Product List — hallifresh" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const cats = useServerFn(listCategories);
  const prods = useServerFn(listProducts);
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => cats() });
  const prodsQ = useQuery({ queryKey: ["products"], queryFn: () => prods() });
  const navigate = useNavigate();
  const cart = useCart();
  const { itemsCount } = cartTotals(cart);

  const categories = catsQ.data ?? [];
  const products = prodsQ.data ?? [];
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = products;
    if (active) list = list.filter((p) => p.category_slug === active);
    if (q.trim()) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [products, active, q]);

  const popular = filtered.slice(0, 6);
  const newArrivals = filtered.slice(6, 12);

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="grid h-11 w-11 place-items-center rounded-full bg-card ring-1 ring-border"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-extrabold">Product List</h1>
          <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-card ring-1 ring-border">
            <ShoppingBasket className="h-[18px] w-[18px]" />
            {itemsCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-cta px-1 text-[10px] font-bold text-cta-foreground">
                {itemsCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search */}
        <div className="mt-5 flex items-stretch gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your products"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button className="grid h-[46px] w-[46px] place-items-center rounded-2xl bg-cta text-cta-foreground shadow-pop">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Category chips */}
        <div className="-mx-5 mt-5 flex gap-3 overflow-x-auto scrollbar-hide px-5 pb-1">
          {(catsQ.isLoading ? Array.from({ length: 5 }) : categories).map((c: any, i) => {
            const isActive = active === c?.slug;
            return (
              <button
                key={c?.slug ?? i}
                onClick={() => setActive((prev) => (prev === c?.slug ? null : c?.slug))}
                className={`flex shrink-0 items-center gap-2 rounded-full py-2 pl-2 pr-4 ring-1 transition ${
                  isActive ? "bg-primary text-primary-foreground ring-primary" : "bg-card ring-border"
                }`}
              >
                <span
                  className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-muted"
                  style={c?.tint ? { backgroundColor: c.tint } : undefined}
                >
                  {c?.image && <img src={c.image} alt="" className="h-8 w-8 object-cover" loading="lazy" />}
                </span>
                <span className="text-sm font-bold">{c?.name ?? "…"}</span>
              </button>
            );
          })}
        </div>

        {/* Popular */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">Popular</h2>
          <button className="text-xs font-semibold text-muted-foreground">View all</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {(prodsQ.isLoading ? Array.from({ length: 4 }) : popular).map((p: any, i) => (
            <DetailCard key={p?.id ?? i} product={p} />
          ))}
        </div>

        {newArrivals.length > 0 && (
          <>
            <div className="mt-7 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold">New arrival</h2>
              <button className="text-xs font-semibold text-muted-foreground">View all</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {newArrivals.map((p) => <DetailCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DetailCard({ product }: { product?: Product }) {
  if (!product) return <div className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />;
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const badge = off > 0 ? { text: `${off}% OFF`, bg: "bg-[oklch(0.55_0.22_28)]" } : { text: "Best sale", bg: "bg-[oklch(0.32_0.12_270)]" };
  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <div className="relative bg-muted/40 p-3">
        <span className={`absolute left-0 top-0 rounded-br-lg ${badge.bg} px-2 py-1 text-[10px] font-bold leading-tight text-white`}>
          {badge.text}
        </span>
        <Link to="/p/$id" params={{ id: product.slug }}>
          <img src={product.image} alt={product.name} className="mx-auto h-28 w-full object-contain" loading="lazy" />
        </Link>
      </div>
      <div className="px-3 pb-3 pt-2">
        <Link to="/p/$id" params={{ id: product.slug }} className="line-clamp-1 text-sm font-extrabold">
          {product.name}
        </Link>
        <div className="text-xs text-muted-foreground">{product.weight}</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <div className="text-sm font-extrabold text-primary">${product.price}</div>
            {off > 0 && (
              <div className="text-[10px] text-muted-foreground line-through">${product.mrp}</div>
            )}
          </div>
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
