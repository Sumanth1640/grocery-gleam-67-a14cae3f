import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { dualApi } from "@/lib/dual-api";
import {
  MapPin,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Clock,
  ChevronRight,
  Heart,
  Plus,
} from "lucide-react";
import { CUISINES, type Restaurant } from "@/lib/food-data";
import { listAllApprovedDishes, listApprovedRestaurants } from "@/lib/partner-public.functions";
import { foodCartStore, useFoodCart, foodCartTotals } from "@/lib/food-cart-store";
import { restaurantFavsStore, useRestaurantFavs } from "@/lib/restaurant-favs-store";

type DbDish = Awaited<ReturnType<typeof listAllApprovedDishes>>[number];

/**
 * Native-shell Food home — mirrors the MobileHome aesthetic.
 */
export function MobileFood() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);

  const partnerFn = useDualFn(listApprovedRestaurants, (d: any) => php.restaurants(d?.q));
  const dishesFn = useDualFn(listAllApprovedDishes, () => dualApi.allDishes());
  const partnerQ = useQuery({ queryKey: ["approved-restaurants"], queryFn: () => partnerFn() });
  const dishesQ = useQuery({ queryKey: ["public-all-dishes"], queryFn: () => dishesFn() });
  const foodCart = useFoodCart();
  const { itemsCount } = foodCartTotals(foodCart);

  const restaurants = useMemo<Restaurant[]>(() => {
    return (partnerQ.data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      image: r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      cover:
        r.cover || r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600",
      cuisines: r.cuisines ?? [],
      rating: Number(r.rating ?? 4.5),
      reviewsCount: r.reviews_count ?? 0,
      etaMins: r.eta_mins,
      distanceKm: Number(r.distance_km),
      costForTwo: r.cost_for_two,
      priceTier: r.price_tier as 1 | 2 | 3,
      veg: r.veg,
      area: r.area,
      offer: r.offer ?? undefined,
      menu: [],
    }));
  }, [partnerQ.data]);

  const visible = useMemo(() => {
    let list = restaurants.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(needle) ||
          r.cuisines.some((c) => c.toLowerCase().includes(needle)),
      );
    }
    if (cuisine) list = list.filter((r) => r.cuisines.includes(cuisine));
    return list;
  }, [restaurants, q, cuisine]);

  const popular = visible.slice(0, 6);
  const popularDishes = (dishesQ.data ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.005_145)] pb-32">
      {/* Top: location + cart */}
      <header className="flex items-start justify-between px-5 pb-2 pt-6">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" /> Delivery to
          </div>
          <div className="mt-0.5 text-sm font-bold tracking-tight">Bengaluru, India</div>
        </div>
        <Link
          to="/food/cart"
          aria-label="Food cart"
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

      {/* Headline */}
      <h1 className="px-5 pt-4 font-display text-[28px] font-extrabold leading-[1.15] tracking-tight">
        Hot <span className="text-primary">meals</span>, delivered to your door.
      </h1>

      {/* Search + filter */}
      <form
        className="mt-5 flex items-center gap-2 px-5"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search restaurants or dishes"
            className="h-12 w-full rounded-2xl bg-card pl-11 pr-4 text-sm font-medium shadow-card outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="button"
          aria-label="Filter"
          onClick={() => navigate({ to: "/food/dishes" })}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-[oklch(0.7_0.2_45)] text-white shadow-pop"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </form>

      {/* Cuisine chips */}
      <div className="mt-5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setCuisine(null)}
          className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 shadow-card ${cuisine === null ? "bg-primary text-primary-foreground" : "bg-card"}`}
        >
          <span className="text-sm font-bold">All</span>
        </button>
        {CUISINES.map((c) => (
          <button
            key={c}
            onClick={() => setCuisine(cuisine === c ? null : c)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 shadow-card ${cuisine === c ? "bg-primary text-primary-foreground" : "bg-card"}`}
          >
            <span className="text-sm font-bold">{c}</span>
          </button>
        ))}
      </div>

      {/* Promo banner */}
      <div className="mt-5 px-5">
        <Link
          to="/food/offers"
          className="relative flex items-center justify-between gap-3 overflow-hidden rounded-3xl bg-[oklch(0.5_0.22_25)] p-5 text-white shadow-pop"
        >
          <div className="relative z-10 max-w-[60%]">
            <div className="text-[11px] font-semibold opacity-90">Hurry Up! Get 20% Off</div>
            <div className="mt-1 font-display text-lg font-extrabold leading-tight">
              Fresh meals from your favourite kitchens
            </div>
            <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-bold text-foreground">
              See Offers
            </span>
          </div>
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=70"
            alt=""
            className="pointer-events-none absolute -right-4 bottom-0 top-0 my-auto h-32 w-32 rounded-full object-cover opacity-95"
          />
        </Link>
      </div>

      {/* Popular */}
      <div className="mt-7 flex items-end justify-between px-5">
        <h2 className="font-display text-xl font-extrabold">Popular near you</h2>
        <Link
          to="/food/dishes"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 px-5">
        {dishesQ.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MobileDishSkeleton key={i} />)
          : popularDishes.map((d) => <MobileDishCard key={d.id} dish={d} />)}
      </div>

      <div className="mt-7 flex items-end justify-between px-5">
        <h2 className="font-display text-xl font-extrabold">Restaurants</h2>
        <Link
          to="/food"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-4 px-5">
        {partnerQ.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-card p-3 shadow-card">
                <div className="aspect-[16/10] w-full animate-pulse rounded-2xl bg-muted" />
                <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            ))
          : popular.map((r) => <MobileRestaurantCard key={r.id} r={r} />)}
        {!partnerQ.isLoading && popular.length === 0 && (
          <div className="rounded-3xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
            No restaurants match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function MobileDishSkeleton() {
  return (
    <div className="rounded-3xl bg-card p-3 shadow-card">
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted" />
      <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}

function MobileDishCard({ dish }: { dish: DbDish }) {
  const restaurant = dish.restaurant ?? {};
  const mappedRestaurant: Restaurant = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    image: restaurant.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    cover:
      restaurant.cover ||
      restaurant.image ||
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600",
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
    <div className="relative flex flex-col rounded-3xl bg-card p-3 shadow-card">
      <Link
        to="/food/r/$slug"
        params={{ slug: mappedRestaurant.slug }}
        className="block aspect-square overflow-hidden rounded-2xl bg-muted"
      >
        <img
          src={mappedDish.image}
          alt={mappedDish.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="mt-3 line-clamp-1 text-sm font-bold">{mappedDish.name}</div>
      <div className="line-clamp-1 text-[11px] text-muted-foreground">
        {mappedRestaurant.name} · {mappedDish.section}
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-base font-extrabold">₹{mappedDish.price}</div>
        <button
          onClick={() => foodCartStore.add(mappedRestaurant, mappedDish)}
          aria-label="Add dish"
          className="grid h-9 w-9 place-items-center rounded-full bg-[oklch(0.7_0.2_45)] text-white shadow-pop transition active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function MobileRestaurantCard({ r }: { r: Restaurant }) {
  const favs = useRestaurantFavs();
  const isFav = !!favs[r.id];
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card shadow-card">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          restaurantFavsStore.toggle(r);
        }}
        aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-card backdrop-blur"
      >
        <Heart
          className={`h-4 w-4 ${isFav ? "fill-[oklch(0.6_0.22_25)] text-[oklch(0.6_0.22_25)]" : "text-muted-foreground"}`}
        />
      </button>
      <Link to="/food/r/$slug" params={{ slug: r.slug }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover" />
          {r.offer && (
            <div className="absolute left-3 top-3 rounded-md bg-[oklch(0.6_0.22_25)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-pop">
              {r.offer}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-extrabold">{r.name}</h3>
            <div className="inline-flex items-center gap-0.5 rounded-md bg-[oklch(0.55_0.16_145)] px-1.5 py-0.5 text-[11px] font-bold text-white">
              <Star className="h-3 w-3 fill-current" /> {r.rating}
            </div>
          </div>
          <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {r.cuisines.join(" · ")}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {r.etaMins} min
            </span>
            <span>₹{r.costForTwo} for two</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
