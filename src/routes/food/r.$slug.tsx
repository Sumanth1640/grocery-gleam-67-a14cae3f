import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { type Dish, type Restaurant } from "@/lib/food-data";
import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { DishCustomizeDialog, VegBadge, QtyStepper } from "@/components/site/DishCustomizeDialog";
import { ArrowLeft, Star, Clock, MapPin, Plus, Flame, Award, ShoppingBag, Heart } from "lucide-react";
import { restaurantFavsStore, useRestaurantFavs } from "@/lib/restaurant-favs-store";
import { toast } from "sonner";
import { ReviewsSection } from "@/components/site/ReviewsSection";

import { dualApi } from "@/lib/dual-api";
import { listOutletsForRestaurant } from "@/lib/outlets.functions";
import { useDualFn } from "@/lib/use-dual-fn";
import { useQuery } from "@tanstack/react-query";
import { useIsNative } from "@/lib/use-native";
import { MobileFoodRestaurant } from "@/components/native/MobileFoodRestaurant";

export const Route = createFileRoute("/food/r/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Order online · hallifresh` }],
  }),
  loader: async ({ params }) => {
    // Use dualApi so PHP-mode deployments hit the partner_restaurants table.
    const db = (await dualApi.getRestaurant(params.slug)) as any;
    if (!db) throw notFound();
    const dishes = (db.partner_dishes ?? []) as Array<{
      id: string; name: string; description: string; image: string; price: number; mrp: number | null;
      veg: boolean; spicy: boolean; bestseller: boolean; section: string; in_stock: boolean; rating: number;
      available_days?: number[] | null; available_from?: string | null; available_to?: string | null;
      partner_dish_variants?: Array<{ id: string; name: string; price: number }>;
      partner_dish_addons?: Array<{ id: string; name: string; price: number }>;
    }>;
    const now = new Date();
    const dayIdx = now.getDay();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const isAvailableNow = (d: typeof dishes[number]) => {
      const days = d.available_days ?? [0,1,2,3,4,5,6];
      if (!days.includes(dayIdx)) return false;
      const from = d.available_from ?? "00:00";
      const to = d.available_to ?? "23:59";
      return hhmm >= from && hhmm <= to;
    };
    const menu: Dish[] = dishes.filter(isAvailableNow).map((d) => ({
      id: d.id, name: d.name, desc: d.description ?? "", image: d.image || "",
      price: d.price, mrp: d.mrp ?? undefined,
      veg: d.veg, spicy: d.spicy, bestseller: d.bestseller, section: d.section,
      rating: Number(d.rating ?? 4.5),
      variants: (d.partner_dish_variants ?? []).map((v) => ({ id: v.id, name: v.name, price: v.price })),
      addons: (d.partner_dish_addons ?? []).map((a) => ({ id: a.id, name: a.name, price: a.price })),
    }));
    const r: Restaurant = {
      id: db.id, slug: db.slug, name: db.name,
      image: db.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      cover: db.cover || db.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600",
      cuisines: db.cuisines ?? [], rating: Number(db.rating ?? 4.5), reviewsCount: db.reviews_count ?? 0,
      etaMins: db.eta_mins, distanceKm: Number(db.distance_km), costForTwo: db.cost_for_two,
      priceTier: db.price_tier as 1 | 2 | 3, veg: db.veg, area: db.area,
      offer: db.offer ?? undefined,
      menu,
    };
    return r;
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Restaurant not found</h1>
        <Link to="/food" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
          Back to restaurants
        </Link>
      </div>
      <Footer />
    </div>
  ),
  component: RestaurantPage,
});

const SAMPLE_REVIEWS = [
  { name: "Aarav S.", stars: 5, text: "Food was piping hot and the packaging was top notch. Will order again!" },
  { name: "Diya P.", stars: 4, text: "Tasty and generous portions. Delivery was 10 mins faster than promised." },
  { name: "Karan M.", stars: 4, text: "Loved the flavours, slight delay but the rider was polite." },
];

function RestaurantPage() {
  const r = Route.useLoaderData() as Restaurant;
  const isNative = useIsNative();
  if (isNative) return <MobileFoodRestaurant r={r} />;
  return <WebRestaurantPage r={r} />;
}

function WebRestaurantPage({ r }: { r: Restaurant }) {
  const [vegOnly, setVegOnly] = useState(false);
  const [openDish, setOpenDish] = useState<Dish | null>(null);
  const cart = useFoodCart();
  const totals = foodCartTotals(cart);
  const cartIsThisRestaurant = totals.items[0]?.restaurantId === r.id;

  const sections = useMemo(() => {
    const map = new Map<string, Dish[]>();
    for (const d of r.menu) {
      if (vegOnly && !d.veg) continue;
      const arr = map.get(d.section) ?? [];
      arr.push(d);
      map.set(d.section, arr);
    }
    return [...map.entries()];
  }, [r, vegOnly]);

  const bestsellers = r.menu.filter((d) => d.bestseller);

  const handleAdd = (dish: Dish) => {
    if (totals.items.length > 0 && totals.items[0].restaurantId !== r.id) {
      if (!confirm(`Your cart has items from ${totals.items[0].restaurantName}. Replace with ${r.name}?`)) return;
    }
    if ((dish.variants && dish.variants.length > 0) || (dish.addons && dish.addons.length > 0)) {
      setOpenDish(dish);
    } else {
      foodCartStore.add(r, dish);
      toast.success(`${dish.name} added`);
    }
  };

  const lineFor = (dishId: string) => totals.items.filter((i) => i.dishId === dishId);

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <Header />

      {/* Cover */}
      <div className="relative h-44 w-full overflow-hidden md:h-64">
        <img src={r.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40" />
        <Link to="/food" className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">
          <ArrowLeft className="h-3.5 w-3.5" /> All restaurants
        </Link>
      </div>

      {/* Header card */}
      <div className="relative z-10 mx-auto -mt-10 max-w-5xl px-4 md:-mt-16">
        <div className="rounded-2xl border bg-card p-5 shadow-pop md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold md:text-3xl">{r.name}</h1>
              <div className="mt-1 text-xs text-muted-foreground">{r.cuisines.join(" · ")}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {r.area} · {r.distanceKm} km
              </div>
            </div>
            <div className="flex items-start gap-2">
              <FavHeart restaurant={r} />
              <div className="rounded-xl border p-3 text-center">
                <div className="inline-flex items-center gap-0.5 rounded-md bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">
                  <Star className="h-3 w-3 fill-current" /> {r.rating}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{r.reviewsCount.toLocaleString()} ratings</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 border-t pt-4 text-xs">
            <Stat icon={<Clock className="h-3.5 w-3.5" />} text={`${r.etaMins} min delivery`} />
            <Stat icon={<ShoppingBag className="h-3.5 w-3.5" />} text={`₹${r.costForTwo} for two`} />
            {r.offer && <Stat icon={<Award className="h-3.5 w-3.5 text-discount" />} text={r.offer} />}
          </div>
        </div>
      </div>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="mx-auto mt-8 max-w-5xl px-4">
          <h2 className="font-display text-lg font-bold">Bestsellers</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-3">
            {bestsellers.map((d) => (
              <button
                key={d.id}
                onClick={() => handleAdd(d)}
                className="group w-44 shrink-0 overflow-hidden rounded-xl border bg-card text-left shadow-card hover:shadow-soft"
              >
                <div className="relative aspect-square">
                  <img src={d.image} alt={d.name} className="h-full w-full object-cover" />
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-discount px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                    <Flame className="h-2.5 w-2.5" /> Top
                  </span>
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 text-sm font-bold">{d.name}</div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="font-bold">₹{d.price}</span>
                    <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">+ ADD</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Filter */}
      <section className="mx-auto mt-6 max-w-5xl px-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-display text-lg font-bold">Menu</h2>
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${vegOnly ? "border-success bg-success/10 text-success" : "hover:bg-secondary"}`}
          >
            <span className={`grid h-3 w-3 place-items-center rounded-sm border ${vegOnly ? "border-success" : "border-border"}`}>
              {vegOnly && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
            </span>
            Veg only
          </button>
        </div>
      </section>

      {/* Sections */}
      <section className="mx-auto max-w-5xl px-4 py-4">
        {sections.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">No items match this filter.</div>
        )}
        {sections.map(([name, items]) => (
          <div key={name} className="mb-8">
            <h3 className="font-display text-base font-bold">{name} <span className="text-muted-foreground">({items.length})</span></h3>
            <ul className="mt-3 divide-y rounded-2xl border bg-card">
              {items.map((d) => {
                const lines = lineFor(d.id);
                const inCart = lines.reduce((s, l) => s + l.qty, 0);
                return (
                  <li key={d.id} className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <VegBadge veg={d.veg} />
                        {d.bestseller && <span className="inline-flex items-center gap-0.5 rounded bg-discount/10 px-1.5 py-0.5 text-[10px] font-bold text-discount"><Flame className="h-2.5 w-2.5" /> Bestseller</span>}
                        {d.spicy && <span className="text-[10px] text-discount">🌶 Spicy</span>}
                      </div>
                      <div className="mt-1 font-bold">{d.name}</div>
                      <div className="mt-0.5 text-sm font-semibold">
                        ₹{d.price}
                        {d.mrp && d.mrp > d.price && <span className="ml-2 text-xs text-muted-foreground line-through">₹{d.mrp}</span>}
                      </div>
                      {d.rating && (
                        <div className="mt-1 inline-flex items-center gap-0.5 text-xs text-success">
                          <Star className="h-3 w-3 fill-current" /> {d.rating}
                        </div>
                      )}
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.desc}</p>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <img src={d.image} alt={d.name} className="aspect-square w-28 rounded-xl object-cover" />
                      {inCart > 0 && cartIsThisRestaurant && lines.length === 1 ? (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                          <QtyStepper
                            qty={inCart}
                            onInc={() => foodCartStore.inc(lines[0].lineId)}
                            onDec={() => foodCartStore.dec(lines[0].lineId)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(d)}
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-xl bg-card border-2 border-primary px-4 py-1.5 text-xs font-bold text-primary shadow-pop hover:bg-primary hover:text-primary-foreground"
                        >
                          {inCart > 0 ? `${inCart} ADDED` : <><Plus className="h-3.5 w-3.5" /> ADD</>}
                          {(d.variants?.length || d.addons?.length) ? <span className="text-[9px]">customize</span> : null}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {/* Outlets */}
      <OutletsSection restaurantId={r.id} />

      {/* Reviews */}
      <section className="mx-auto max-w-5xl px-4 py-6">
        <ReviewsSection targetType="restaurant" targetId={r.id} seedRating={r.rating} />
      </section>


      <Footer />
      <BottomNav />

      {/* Floating cart bar */}
      {totals.itemsCount > 0 && cartIsThisRestaurant && (
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
        <DishCustomizeDialog open onClose={() => setOpenDish(null)} restaurant={r} dish={openDish} />
      )}
    </div>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 font-semibold text-foreground/80">
      <span className="text-primary">{icon}</span>
      {text}
    </div>
  );
}

function FavHeart({ restaurant }: { restaurant: Restaurant }) {
  const favs = useRestaurantFavs();
  const isFav = !!favs[restaurant.id];
  return (
    <button
      onClick={() => {
        restaurantFavsStore.toggle(restaurant);
        toast.success(restaurantFavsStore.has(restaurant.id) ? "Saved to favourites" : "Removed");
      }}
      aria-label="Toggle favourite"
      className="grid h-10 w-10 place-items-center rounded-full border bg-card hover:bg-secondary"
    >
      <Heart className={`h-4 w-4 ${isFav ? "fill-discount text-discount" : "text-muted-foreground"}`} />
    </button>
  );
}

function OutletsSection({ restaurantId }: { restaurantId: string }) {
  const listFn = useDualFn(listOutletsForRestaurant, async () => []);
  const q = useQuery({
    queryKey: ["public-outlets", restaurantId],
    queryFn: () => listFn({ data: { restaurant_id: restaurantId } }),
  });
  const outlets = q.data ?? [];
  if (!outlets.length) return null;
  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="font-display text-lg font-bold">Outlets near you</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {outlets.map((o: any) => (
          <div key={o.id} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold">{o.name}</div>
                {!o.is_open && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Closed</span>}
              </div>
              <div className="truncate text-xs text-muted-foreground">{o.area || ""}{o.pincode ? ` · ${o.pincode}` : ""}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-foreground/80">
                <Clock className="h-3 w-3 text-primary" /> {o.eta_mins} min
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
