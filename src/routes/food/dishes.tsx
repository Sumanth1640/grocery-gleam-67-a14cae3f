import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { RESTAURANTS, type Dish, type Restaurant } from "@/lib/food-data";
import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { DishCustomizeDialog, VegBadge } from "@/components/site/DishCustomizeDialog";
import { Search, Star, Flame, Plus, ShoppingBag, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { listAllApprovedDishes } from "@/lib/partner-public.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";

type DishWithRestaurant = Dish & { restaurant: Restaurant };

type Sort = "relevance" | "rating" | "price-asc" | "price-desc";

export const Route = createFileRoute("/food/dishes")({
  head: () => ({
    meta: [
      { title: "Browse all dishes — hallifresh" },
      { name: "description", content: "Search dishes across every restaurant. Filter by veg, price, rating and category." },
    ],
  }),
  component: DishesPage,
});

const SEED_DISHES: DishWithRestaurant[] = RESTAURANTS.flatMap((r) =>
  r.menu.map((d) => ({ ...d, restaurant: r })),
);

function mapDbDish(d: any): DishWithRestaurant {
  const r = d.restaurant ?? {};
  const restaurant: Restaurant = {
    id: r.id, slug: r.slug, name: r.name,
    image: r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    cover: r.cover || r.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600",
    cuisines: r.cuisines ?? [], rating: Number(r.rating ?? 4.5), reviewsCount: r.reviews_count ?? 0,
    etaMins: r.eta_mins ?? 30, distanceKm: Number(r.distance_km ?? 1),
    costForTwo: r.cost_for_two ?? 400, priceTier: (r.price_tier ?? 2) as 1 | 2 | 3,
    veg: !!r.veg, area: r.area ?? "", offer: r.offer ?? undefined, menu: [],
  };
  return {
    id: d.id, name: d.name, desc: d.description ?? "", image: d.image || "",
    price: d.price, mrp: d.mrp ?? undefined, veg: !!d.veg, spicy: !!d.spicy,
    bestseller: !!d.bestseller, section: d.section, rating: Number(d.rating ?? 4.5),
    variants: (d.partner_dish_variants ?? []).map((v: any) => ({ id: v.id, name: v.name, price: v.price })),
    addons: (d.partner_dish_addons ?? []).map((a: any) => ({ id: a.id, name: a.name, price: a.price })),
    restaurant,
  };
}


function DishesPage() {
  const cart = useFoodCart();
  const totals = foodCartTotals(cart);
  const [openDish, setOpenDish] = useState<DishWithRestaurant | null>(null);

  const fetchDishes = useServerFn(listAllApprovedDishes);
  const { data: dbDishes } = useQuery({
    queryKey: ["public-all-dishes"],
    queryFn: () => fetchDishes(),
    staleTime: 60_000,
  });

  const ALL_DISHES: DishWithRestaurant[] = useMemo(() => {
    const fromDb = (dbDishes ?? []).map(mapDbDish);
    return [...fromDb, ...SEED_DISHES];
  }, [dbDishes]);
  const SECTIONS = useMemo(() => Array.from(new Set(ALL_DISHES.map((d) => d.section))).sort(), [ALL_DISHES]);

  const [q, setQ] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(600);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const visible = useMemo(() => {
    let list = ALL_DISHES.slice();

    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(needle) ||
          d.desc.toLowerCase().includes(needle) ||
          d.restaurant.name.toLowerCase().includes(needle),
      );
    }
    if (vegOnly) list = list.filter((d) => d.veg);
    if (bestsellerOnly) list = list.filter((d) => d.bestseller);
    if (section) list = list.filter((d) => d.section === section);
    list = list.filter((d) => d.price <= maxPrice);
    if (minRating > 0) list = list.filter((d) => (d.rating ?? 0) >= minRating);
    switch (sort) {
      case "rating": list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
    }
    return list;
  }, [q, vegOnly, bestsellerOnly, section, maxPrice, minRating, sort]);

  const handleAdd = (d: DishWithRestaurant) => {
    if (totals.items.length > 0 && totals.items[0].restaurantId !== d.restaurant.id) {
      if (!confirm(`Your cart has items from ${totals.items[0].restaurantName}. Replace with ${d.restaurant.name}?`)) return;
    }
    if ((d.variants && d.variants.length > 0) || (d.addons && d.addons.length > 0)) {
      setOpenDish(d);
    } else {
      foodCartStore.add(d.restaurant, d);
      toast.success(`${d.name} added`);
    }
  };

  const clearFilters = () => {
    setVegOnly(false); setBestsellerOnly(false); setSection(null);
    setMaxPrice(600); setMinRating(0); setSort("relevance");
  };

  const activeFilters = (vegOnly ? 1 : 0) + (bestsellerOnly ? 1 : 0) + (section ? 1 : 0) + (minRating > 0 ? 1 : 0) + (maxPrice < 600 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <Header />

      <div className="border-b bg-gradient-to-br from-brand/10 via-background to-primary/5">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">All dishes</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ALL_DISHES.length} dishes across {RESTAURANTS.length} restaurants</p>

          <div className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dish, restaurant or cuisine…"
                className="w-full rounded-xl border bg-card py-3 pl-9 pr-3 text-sm outline-none focus:ring-focus"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 text-sm font-bold hover:bg-secondary"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters{activeFilters > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeFilters}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block`}>
          <div className="rounded-2xl border bg-card p-4 shadow-card md:sticky md:top-20">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold">Filters</h2>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Toggle label="Veg only" active={vegOnly} onClick={() => setVegOnly((v) => !v)} />
              <Toggle label="Bestsellers" active={bestsellerOnly} onClick={() => setBestsellerOnly((v) => !v)} />
            </div>

            <div className="mt-5">
              <Label>Sort by</Label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="mt-1 w-full rounded-lg border bg-background px-2 py-2 text-xs outline-none focus:ring-focus"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Rating</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>

            <div className="mt-5">
              <Label>Max price: ₹{maxPrice}</Label>
              <input
                type="range" min={50} max={600} step={20}
                value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
            </div>

            <div className="mt-5">
              <Label>Min rating</Label>
              <div className="mt-1 flex gap-1">
                {[0, 4, 4.3, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${minRating === r ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"}`}
                  >
                    {r === 0 ? "Any" : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <Label>Category</Label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSection(null)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${!section ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"}`}
                >All</button>
                {SECTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSection(s === section ? null : s)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${section === s ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-3 text-xs text-muted-foreground">{visible.length} dishes</div>
          {visible.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center">
              <div className="font-display text-lg font-bold">No dishes match</div>
              <p className="mt-1 text-sm text-muted-foreground">Try clearing some filters.</p>
              <button onClick={clearFilters} className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop">
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {visible.map((d) => (
                <li key={`${d.restaurant.id}-${d.id}`} className="flex gap-3 rounded-2xl border bg-card p-3 shadow-card">
                  <div className="relative shrink-0">
                    <img src={d.image} alt={d.name} className="h-24 w-24 rounded-xl object-cover" />
                    <button
                      onClick={() => handleAdd(d)}
                      className="absolute -bottom-2 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-lg border-2 border-primary bg-card px-2.5 py-1 text-[10px] font-bold text-primary shadow-pop hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="h-3 w-3" /> ADD
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <VegBadge veg={d.veg} />
                      {d.bestseller && <span className="inline-flex items-center gap-0.5 rounded bg-discount/10 px-1 py-0.5 text-[9px] font-bold text-discount"><Flame className="h-2.5 w-2.5" />Top</span>}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-sm font-bold">{d.name}</div>
                    <Link to="/food/r/$slug" params={{ slug: d.restaurant.slug }} className="line-clamp-1 text-[11px] text-muted-foreground hover:text-primary">
                      {d.restaurant.name} · {d.section}
                    </Link>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm font-bold">₹{d.price}</span>
                      {d.rating && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-success">
                          <Star className="h-3 w-3 fill-current" /> {d.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Floating cart bar */}
      {totals.itemsCount > 0 && (
        <Link
          to="/food/cart"
          className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-pop md:bottom-6"
        >
          <div>
            <div className="text-xs font-semibold opacity-90">{totals.itemsCount} item{totals.itemsCount > 1 ? "s" : ""} · ₹{totals.subtotal}</div>
            <div className="text-xs opacity-80">View cart</div>
          </div>
          <ShoppingBag className="h-5 w-5" />
        </Link>
      )}

      {openDish && (
        <DishCustomizeDialog
          open
          onClose={() => setOpenDish(null)}
          restaurant={openDish.restaurant}
          dish={openDish}
        />
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold ${active ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"}`}
    >
      <span>{label}</span>
      <span className={`grid h-4 w-4 place-items-center rounded border-2 ${active ? "border-primary bg-primary" : "border-border"}`}>
        {active && <span className="h-1.5 w-1.5 rounded-sm bg-primary-foreground" />}
      </span>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{children}</div>;
}
