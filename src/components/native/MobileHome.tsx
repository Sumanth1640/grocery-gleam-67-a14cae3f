import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Plus, Search, Sparkles, Star, Clock } from "lucide-react";
import { dualApi } from "@/lib/dual-api";
import { cartStore } from "@/lib/cart-store";
import { foodCartStore } from "@/lib/food-cart-store";
import { NativeBannerCarousel } from "@/components/native/NativeBannerCarousel";
import { NativeAddressPicker } from "@/components/native/NativeAddressPicker";
import { NativeFurniturePromos } from "@/components/native/NativeFurniturePromos";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

/**
 * Premium dark-dock native home — used inside the Capacitor shell.
 */
export function MobileHome() {
  const navigate = useNavigate();
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => dualApi.listCategories() });
  const prodsQ = useQuery({ queryKey: ["products"], queryFn: () => dualApi.listProducts() });
  const restosQ = useQuery({ queryKey: ["approved-restaurants"], queryFn: () => dualApi.restaurants() });
  const dishesQ = useQuery({ queryKey: ["public-all-dishes"], queryFn: () => dualApi.allDishes() });
  const [q, setQ] = useState("");

  const categories = (catsQ.data ?? []).slice(0, 10);
  const products = (prodsQ.data ?? []).slice(0, 6);
  const restaurants = (restosQ.data ?? []).slice(0, 4);
  const popularDishes = (dishesQ.data ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-white pb-36" style={FONT}>
      {/* Header */}
      <header className="px-6 pt-10 pb-3">
        {/* Centered logo */}
        <div className="mb-4 flex justify-center">
          <HallifreshLogo size="md" />
        </div>

        <div className="flex items-center justify-between">
          <NativeAddressPicker />
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
          >
            <Bell className="h-5 w-5 text-zinc-600" strokeWidth={2} />
          </Link>
        </div>


        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search", search: { q } });
          }}
          className="relative mt-4 flex items-center"
        >
          <Search className="pointer-events-none absolute left-4 h-5 w-5 text-zinc-400" strokeWidth={2.5} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Groceries or Food..."
            className="w-full rounded-2xl border-none bg-zinc-100 py-3.5 pl-12 pr-14 text-sm font-medium outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30"
          />
          <button
            type="submit"
            aria-label="Filter"
            className="absolute right-3 grid h-8 w-8 place-items-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-200"
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>
      </header>

      <div className="space-y-8 px-6 pt-3">
        {/* Dynamic auto-swapping banners (managed in Admin → Banners) */}
        <NativeBannerCarousel />


        {/* Categories */}
        <div className="flex gap-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {catsQ.isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                  <div className="h-16 w-16 animate-pulse rounded-3xl bg-zinc-100" />
                  <div className="h-3 w-12 animate-pulse rounded bg-zinc-100" />
                </div>
              ))
            : categories.map((c: any, i: number) => {
                const tints = [
                  "bg-emerald-50 border-emerald-100",
                  "bg-orange-50 border-orange-100",
                  "bg-blue-50 border-blue-100",
                  "bg-purple-50 border-purple-100",
                  "bg-amber-50 border-amber-100",
                  "bg-rose-50 border-rose-100",
                ];
                return (
                  <Link
                    key={c.slug}
                    to="/c/$slug"
                    params={{ slug: c.slug }}
                    className="flex shrink-0 flex-col items-center gap-2"
                  >
                    <div
                      className={`h-16 w-16 overflow-hidden rounded-3xl border shadow-sm ${tints[i % tints.length]}`}
                    >
                      <img src={c.image} alt="" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-700">{c.name}</span>
                  </Link>
                );
              })}
        </div>

        {/* Popular Items */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold text-zinc-900">Popular Items</h3>
            <Link
              to="/c/$slug"
              params={{ slug: "fruits" }}
              className="text-xs font-bold text-[oklch(0.55_0.16_145)]"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(prodsQ.isLoading ? Array.from({ length: 4 }) : products).map((p: any, i: number) => (
              <NativeProductCard key={p?.id ?? i} product={p} />
            ))}
          </div>
        </section>

        {/* Furniture promos */}
        <NativeFurniturePromos />

        {/* Popular Dishes */}
        {popularDishes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-extrabold text-zinc-900">Popular Dishes</h3>
              <Link to="/food/dishes" className="text-xs font-bold text-orange-500">
                View all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {popularDishes.map((d: any) => (
                <NativeDishMini key={d.id} dish={d} />
              ))}
            </div>
          </section>
        )}

        {/* Restaurants */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-extrabold text-zinc-900">Hot Restaurants</h3>
            <Link to="/food" className="text-xs font-bold text-orange-500">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {restosQ.isLoading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-[2.5rem] border border-zinc-100 bg-white">
                    <div className="h-44 animate-pulse bg-zinc-100" />
                    <div className="p-5">
                      <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                    </div>
                  </div>
                ))
              : restaurants.map((r: any) => <NativeRestaurantCard key={r.id} r={r} />)}
            {!restosQ.isLoading && restaurants.length === 0 && (
              <div className="rounded-[2.5rem] border border-zinc-100 bg-white p-8 text-center text-sm text-zinc-500">
                No restaurants available yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function NativeProductCard({ product }: { product: any }) {
  if (!product) {
    return (
      <div className="rounded-[2rem] border border-zinc-100 bg-white p-3">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-zinc-100" />
        <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-zinc-100" />
      </div>
    );
  }
  const off = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  return (
    <div className="flex flex-col rounded-[2rem] border border-zinc-100 bg-white p-3 shadow-sm">
      <Link
        to="/p/$id"
        params={{ id: product.slug }}
        className="relative block h-32 overflow-hidden rounded-2xl bg-zinc-50"
      >
        <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        {off > 0 && (
          <span className="absolute left-2 top-2 rounded-lg bg-rose-500 px-2 py-0.5 text-[9px] font-black text-white">
            {off}% OFF
          </span>
        )}
      </Link>
      <div className="px-1 pt-3">
        <Link to="/p/$id" params={{ id: product.slug }} className="line-clamp-1 text-xs font-bold text-zinc-800">
          {product.name}
        </Link>
        <p className="mb-2 text-[10px] font-semibold text-zinc-400">{product.weight}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-zinc-900">₹{product.price}</span>
            {off > 0 && <span className="ml-1 text-[10px] text-zinc-300 line-through">₹{product.mrp}</span>}
          </div>
          <button
            onClick={() => cartStore.add(product)}
            aria-label="Add to cart"
            className="grid h-8 w-8 place-items-center rounded-xl bg-[oklch(0.55_0.16_145)] text-white shadow-lg shadow-emerald-100 transition active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NativeDishMini({ dish }: { dish: any }) {
  const restaurant = dish.restaurant ?? {};
  const mappedRestaurant = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    image: restaurant.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    cover: restaurant.cover || restaurant.image || "",
    cuisines: restaurant.cuisines ?? [],
    rating: Number(restaurant.rating ?? 4.5),
    reviewsCount: restaurant.reviews_count ?? 0,
    etaMins: restaurant.eta_mins ?? 30,
    distanceKm: Number(restaurant.distance_km ?? 1),
    costForTwo: restaurant.cost_for_two ?? 400,
    priceTier: (restaurant.price_tier ?? 2) as 1 | 2 | 3,
    veg: !!restaurant.veg,
    area: restaurant.area ?? "",
    offer: restaurant.offer ?? undefined,
    menu: [],
  };
  const mappedDish = {
    id: dish.id,
    name: dish.name,
    desc: dish.description ?? "",
    image: dish.image || mappedRestaurant.image,
    price: dish.price,
    mrp: dish.mrp ?? undefined,
    veg: !!dish.veg,
    spicy: !!dish.spicy,
    bestseller: !!dish.bestseller,
    rating: Number(dish.rating ?? 4.5),
    section: dish.section,
    variants: dish.partner_dish_variants ?? [],
    addons: dish.partner_dish_addons ?? [],
  };
  return (
    <div className="w-40 shrink-0 rounded-[2rem] border border-zinc-100 bg-white p-3 shadow-sm">
      <Link
        to="/food/r/$slug"
        params={{ slug: mappedRestaurant.slug }}
        className="block h-32 overflow-hidden rounded-2xl bg-zinc-50"
      >
        <img src={mappedDish.image} alt={mappedDish.name} loading="lazy" className="h-full w-full object-cover" />
      </Link>
      <div className="mt-3 line-clamp-1 text-xs font-bold text-zinc-800">{mappedDish.name}</div>
      <div className="line-clamp-1 text-[10px] font-semibold text-zinc-400">{mappedRestaurant.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-black text-zinc-900">₹{mappedDish.price}</span>
        <button
          onClick={() => foodCartStore.add(mappedRestaurant as any, mappedDish as any)}
          aria-label="Add dish"
          className="grid h-8 w-8 place-items-center rounded-xl bg-[oklch(0.55_0.16_145)] text-white shadow-lg shadow-emerald-100 transition active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function NativeRestaurantCard({ r }: { r: any }) {
  return (
    <Link
      to="/food/r/$slug"
      params={{ slug: r.slug }}
      className="block overflow-hidden rounded-[2.5rem] border border-zinc-100 bg-white shadow-sm"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800"}
          alt={r.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        {r.offer && (
          <div className="absolute left-4 top-4 rounded-2xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
            <span className="text-[10px] font-black tracking-tight text-orange-600">{r.offer}</span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1 text-xs font-black text-white shadow-xl">
          {Number(r.rating ?? 4.5)} <Star className="h-3 w-3 fill-current" />
        </div>
      </div>
      <div className="p-5">
        <div className="mb-1 flex items-start justify-between">
          <h4 className="font-display text-lg font-extrabold text-zinc-900">{r.name}</h4>
          <span className="text-[11px] font-bold text-zinc-400">
            ₹{r.cost_for_two} · <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" /> {r.eta_mins}m</span>
          </span>
        </div>
        <p className="line-clamp-1 text-xs font-medium text-zinc-400">{(r.cuisines ?? []).join(" • ")}</p>
      </div>
    </Link>
  );
}
