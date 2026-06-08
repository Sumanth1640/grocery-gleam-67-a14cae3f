import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { type Dish, type Restaurant } from "@/lib/food-data";
import { foodCartStore, foodCartTotals, useFoodCart } from "@/lib/food-cart-store";
import { DishCustomizeDialog } from "@/components/site/DishCustomizeDialog";
import { restaurantFavsStore, useRestaurantFavs } from "@/lib/restaurant-favs-store";
import { ChevronLeft, Clock, Flame, Heart, MapPin, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

export function MobileFoodRestaurant({ r }: { r: Restaurant }) {
  const navigate = useNavigate();
  const [vegOnly, setVegOnly] = useState(false);
  const [openDish, setOpenDish] = useState<Dish | null>(null);
  const cart = useFoodCart();
  const totals = foodCartTotals(cart);
  const cartIsThisRestaurant = totals.items[0]?.restaurantId === r.id;
  const favs = useRestaurantFavs();
  const isFav = !!favs[r.id];

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
      if (!confirm(`Cart has items from ${totals.items[0].restaurantName}. Replace with ${r.name}?`)) return;
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
    <div className="min-h-screen bg-white pb-40" style={FONT}>
      {/* Cover */}
      <div className="relative h-56 w-full overflow-hidden">
        <img src={r.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/40" />
        <button
          onClick={() => navigate({ to: "/food" })}
          className="absolute left-4 top-10 grid h-10 w-10 place-items-center rounded-2xl bg-white/90 backdrop-blur"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <button
          onClick={() => {
            restaurantFavsStore.toggle(r);
            toast.success(restaurantFavsStore.has(r.id) ? "Saved" : "Removed");
          }}
          className="absolute right-4 top-10 grid h-10 w-10 place-items-center rounded-2xl bg-white/90 backdrop-blur"
          aria-label="Favourite"
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-rose-500 text-rose-500" : "text-zinc-700"}`} />
        </button>
      </div>

      {/* Info card */}
      <div className="-mt-10 mx-4 rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.1)] ring-1 ring-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-zinc-900">{r.name}</h1>
            <p className="mt-0.5 text-xs text-zinc-500">{r.cuisines.join(" · ")}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-500">
              <MapPin className="h-3 w-3" /> {r.area} · {r.distanceKm} km
            </p>
          </div>
          <div className="rounded-2xl bg-green-50 px-3 py-2 text-center">
            <div className="inline-flex items-center gap-0.5 text-sm font-extrabold text-green-700">
              <Star className="h-3 w-3 fill-current" /> {r.rating}
            </div>
            <div className="mt-0.5 text-[9px] font-bold text-zinc-500">{r.reviewsCount.toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
          <Chip icon={<Clock className="h-3 w-3" />} text={`${r.etaMins} min`} />
          <Chip icon={<ShoppingBag className="h-3 w-3" />} text={`₹${r.costForTwo} for two`} />
          {r.offer && <Chip icon={<Flame className="h-3 w-3" />} text={r.offer} accent />}
        </div>
      </div>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="mt-6">
          <h2 className="px-5 text-sm font-extrabold text-zinc-900">Bestsellers</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-2">
            {bestsellers.map((d) => (
              <button
                key={d.id}
                onClick={() => handleAdd(d)}
                className="w-40 shrink-0 overflow-hidden rounded-3xl bg-white text-left shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
              >
                <div className="relative aspect-square">
                  <img src={d.image} alt={d.name} className="h-full w-full object-cover" />
                  <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white">
                    <Flame className="h-2.5 w-2.5" /> Top
                  </span>
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 text-xs font-extrabold text-zinc-900">{d.name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-zinc-900">₹{d.price}</span>
                    <span className="rounded-lg px-2 py-0.5 text-[10px] font-extrabold text-white" style={{ background: GREEN }}>+ ADD</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Filter */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-zinc-900">Menu</h2>
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
              vegOnly ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            <span className={`grid h-3 w-3 place-items-center rounded-sm border-2 ${vegOnly ? "border-green-600" : "border-zinc-300"}`}>
              {vegOnly && <span className="h-1.5 w-1.5 rounded-full bg-green-600" />}
            </span>
            Veg only
          </button>
        </div>
      </section>

      {/* Sections */}
      <section className="mt-3 px-5 space-y-6">
        {sections.length === 0 && (
          <div className="rounded-3xl bg-zinc-50 p-8 text-center text-sm text-zinc-500">No items match this filter.</div>
        )}
        {sections.map(([name, items]) => (
          <div key={name}>
            <div className="mb-2 flex items-baseline gap-1">
              <h3 className="text-sm font-extrabold text-zinc-900">{name}</h3>
              <span className="text-[11px] text-zinc-400">({items.length})</span>
            </div>
            <ul className="space-y-2">
              {items.map((d) => {
                const lines = lineFor(d.id);
                const inCart = lines.reduce((s, l) => s + l.qty, 0);
                return (
                  <li
                    key={d.id}
                    className="flex items-start gap-3 rounded-3xl bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`grid h-3.5 w-3.5 place-items-center rounded-sm border-2 ${d.veg ? "border-green-600" : "border-red-500"}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${d.veg ? "bg-green-600" : "bg-red-500"}`} />
                        </span>
                        {d.bestseller && (
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-orange-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-orange-700">
                            <Flame className="h-2 w-2" /> Top
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-zinc-900">{d.name}</div>
                      <div className="mt-0.5 text-sm font-bold text-zinc-900">
                        ₹{d.price}
                        {d.mrp && d.mrp > d.price && (
                          <span className="ml-2 text-[11px] text-zinc-400 line-through">₹{d.mrp}</span>
                        )}
                      </div>
                      {d.rating && (
                        <div className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-bold text-green-700">
                          <Star className="h-2.5 w-2.5 fill-current" /> {d.rating}
                        </div>
                      )}
                      <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500">{d.desc}</p>
                    </div>
                    <div className="relative w-24 shrink-0">
                      <img src={d.image} alt={d.name} className="aspect-square w-24 rounded-2xl object-cover" />
                      {inCart > 0 && cartIsThisRestaurant && lines.length === 1 ? (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-1 py-1 text-white shadow-md" style={{ background: GREEN }}>
                          <button onClick={() => foodCartStore.dec(lines[0].lineId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[14px] text-center text-xs font-extrabold">{inCart}</span>
                          <button onClick={() => foodCartStore.inc(lines[0].lineId)} className="grid h-6 w-6 place-items-center rounded-full bg-white/20">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(d)}
                          className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-extrabold ring-2 shadow-md"
                          style={{ color: GREEN, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderColor: GREEN }}
                        >
                          {inCart > 0 ? `${inCart} ADDED` : (
                            <>
                              <Plus className="h-3 w-3" strokeWidth={3} /> ADD
                            </>
                          )}
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

      {/* Floating cart bar */}
      {totals.itemsCount > 0 && cartIsThisRestaurant && (
        <Link
          to="/food/cart"
          className="fixed inset-x-5 bottom-24 z-40 flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-white shadow-lg shadow-emerald-200"
          style={{ background: GREEN }}
        >
          <div>
            <div className="text-xs font-bold opacity-90">{totals.itemsCount} item{totals.itemsCount > 1 ? "s" : ""}</div>
            <div className="text-sm font-extrabold">₹{totals.subtotal} · View cart</div>
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

function Chip({ icon, text, accent }: { icon: React.ReactNode; text: string; accent?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        accent ? "bg-orange-100 text-orange-700" : "bg-zinc-100 text-zinc-700"
      }`}
    >
      {icon}
      {text}
    </span>
  );
}
