import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { MobileFood } from "@/components/native/MobileFood";
import { useIsNative } from "@/lib/use-native";
import { CUISINES, type Restaurant } from "@/lib/food-data";
import { listApprovedRestaurants } from "@/lib/partner-public.functions";
import { restaurantFavsStore, useRestaurantFavs } from "@/lib/restaurant-favs-store";
import { Search, Star, Clock, MapPin, Filter, X, ChevronDown, Utensils, Heart } from "lucide-react";

export const Route = createFileRoute("/food/")({
  head: () => ({
    meta: [
      { title: "Food delivery in 30 mins — hallifresh" },
      { name: "description", content: "Order from your favourite restaurants. Pizzas, biryanis, burgers, salads — delivered fast." },
    ],
  }),
  component: FoodHome,
});

type Sort = "relevance" | "rating" | "eta" | "cost-asc" | "cost-desc";

function FoodHome() {
  const isNative = useIsNative();
  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [maxEta, setMaxEta] = useState(60);
  const [sort, setSort] = useState<Sort>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const partnerFn = useServerFn(listApprovedRestaurants);
  const partnerQ = useQuery({ queryKey: ["approved-restaurants"], queryFn: () => partnerFn() });

  const allRestaurants = useMemo<Restaurant[]>(() => {
    const partners: Restaurant[] = (partnerQ.data ?? []).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      image: r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      cover: r.cover || r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600",
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
    return partners;
  }, [partnerQ.data]);

  const visible = useMemo(() => {
    let list = allRestaurants.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(needle) ||
          r.cuisines.some((c) => c.toLowerCase().includes(needle)) ||
          r.menu.some((d) => d.name.toLowerCase().includes(needle)),
      );
    }
    if (vegOnly) list = list.filter((r) => r.veg);
    if (cuisine) list = list.filter((r) => r.cuisines.includes(cuisine));
    if (minRating > 0) list = list.filter((r) => r.rating >= minRating);
    list = list.filter((r) => r.etaMins <= maxEta);
    switch (sort) {
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
      case "eta": list.sort((a, b) => a.etaMins - b.etaMins); break;
      case "cost-asc": list.sort((a, b) => a.costForTwo - b.costForTwo); break;
      case "cost-desc": list.sort((a, b) => b.costForTwo - a.costForTwo); break;
    }
    return list;
  }, [allRestaurants, q, vegOnly, cuisine, minRating, maxEta, sort]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* Hero */}
      <section className="border-b bg-aisle">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-discount px-3 py-1 text-xs font-bold text-white shadow-pop">
            <Utensils className="h-3.5 w-3.5" /> Food delivery
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-5xl">
            Hot meals.<br /><span className="text-primary">Doorstep delivered.</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground md:text-base">
            From sizzling biryanis to wood-fired pizzas — freshly cooked, fast.
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search restaurants or dishes…"
              className="w-full rounded-xl border bg-background py-3 pl-9 pr-3 text-sm shadow-card outline-none focus:ring-focus"
            />
          </div>

          {/* Quick links */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/food/dishes" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-bold hover:bg-secondary">
              🍽 All dishes
            </Link>
            <Link to="/food/offers" className="inline-flex items-center gap-1.5 rounded-full border border-discount/40 bg-discount/10 px-3 py-1.5 text-xs font-bold text-discount hover:bg-discount/15">
              🎁 Offers & coupons
            </Link>
            <Link to="/food/favourites" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-bold hover:bg-secondary">
              <Heart className="h-3 w-3" /> Favourites
            </Link>
            <Link to="/food/orders" className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-bold hover:bg-secondary">
              🧾 Past orders
            </Link>
          </div>
        </div>
      </section>

      {/* Cuisine chips */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3">
          <div className="flex gap-2 whitespace-nowrap">
            <Chip active={cuisine === null} onClick={() => setCuisine(null)}>All</Chip>
            {CUISINES.map((c) => (
              <Chip key={c} active={cuisine === c} onClick={() => setCuisine(cuisine === c ? null : c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{visible.length}</span> restaurant{visible.length === 1 ? "" : "s"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setVegOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${vegOnly ? "border-success bg-success/10 text-success" : "hover:bg-secondary"}`}
            >
              <span className={`grid h-3 w-3 place-items-center rounded-sm border ${vegOnly ? "border-success" : "border-border"}`}>
                {vegOnly && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
              </span>
              Pure veg
            </button>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="appearance-none rounded-full border bg-background py-1.5 pl-3 pr-8 text-xs font-semibold hover:bg-secondary"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="rating">Rating (high → low)</option>
                <option value="eta">Delivery time</option>
                <option value="cost-asc">Cost (low → high)</option>
                <option value="cost-desc">Cost (high → low)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 rounded-2xl border bg-card p-4 shadow-card">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min rating</div>
                  <div className="text-xs font-semibold">{minRating > 0 ? `${minRating}+` : "Any"}</div>
                </div>
                <div className="mt-2 flex gap-2">
                  {[0, 3.5, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${minRating === r ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"}`}
                    >
                      {r === 0 ? "Any" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max delivery time</div>
                  <div className="text-xs font-semibold">{maxEta} min</div>
                </div>
                <input
                  type="range" min={20} max={60} step={1}
                  value={maxEta} onChange={(e) => setMaxEta(Number(e.target.value))}
                  className="mt-2 w-full accent-[hsl(var(--primary))]"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => { setMinRating(0); setMaxEta(60); setVegOnly(false); setCuisine(null); }}
                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Restaurants grid */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        {visible.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground">
            No restaurants match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((r) => <RestaurantCard key={r.id} r={r} />)}
          </div>
        )}
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

function RestaurantCard({ r }: { r: Restaurant }) {
  const favs = useRestaurantFavs();
  const isFav = !!favs[r.id];
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); restaurantFavsStore.toggle(r); }}
        aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
        className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/90 shadow-card backdrop-blur transition hover:scale-105"
      >
        <Heart className={`h-4 w-4 ${isFav ? "fill-discount text-discount" : "text-muted-foreground"}`} />
      </button>
      <Link to="/food/r/$slug" params={{ slug: r.slug }} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          {r.offer && (
            <div className="absolute left-3 top-3 rounded-md bg-discount px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-pop">
              {r.offer}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-base font-bold">{r.name}</h3>
            <div className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-[11px] font-bold text-success-foreground">
              <Star className="h-3 w-3 fill-current" /> {r.rating}
            </div>
          </div>
          <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.cuisines.join(" · ")}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.etaMins} min</span>
            <span>₹{r.costForTwo} for two</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.distanceKm} km</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
