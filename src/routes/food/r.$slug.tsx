import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { findRestaurant, type Dish, type Restaurant } from "@/lib/food-data";
import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { DishCustomizeDialog, VegBadge, QtyStepper } from "@/components/site/DishCustomizeDialog";
import { ArrowLeft, Star, Clock, MapPin, Plus, Flame, Award, ShoppingBag, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/food/r/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug} — Order online · freshcart` }],
  }),
  loader: ({ params }) => {
    const r = findRestaurant(params.slug);
    if (!r) throw notFound();
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
      <div className="mx-auto -mt-16 max-w-5xl px-4">
        <div className="rounded-2xl border bg-card p-5 shadow-pop md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold md:text-3xl">{r.name}</h1>
              <div className="mt-1 text-xs text-muted-foreground">{r.cuisines.join(" · ")}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {r.area} · {r.distanceKm} km
              </div>
            </div>
            <div className="rounded-xl border p-3 text-center">
              <div className="inline-flex items-center gap-0.5 rounded-md bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">
                <Star className="h-3 w-3 fill-current" /> {r.rating}
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{r.reviewsCount.toLocaleString()} ratings</div>
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

      {/* Reviews */}
      <section className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="font-display text-lg font-bold">Ratings & reviews</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {SAMPLE_REVIEWS.map((rv, i) => (
            <div key={i} className="rounded-2xl border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{rv.name[0]}</div>
                <div>
                  <div className="text-sm font-bold">{rv.name}</div>
                  <div className="inline-flex items-center text-xs text-success">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className={`h-3 w-3 ${k < rv.stars ? "fill-current" : "opacity-30"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground"><MessageSquare className="mr-1 inline h-3 w-3" />{rv.text}</p>
            </div>
          ))}
        </div>
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
