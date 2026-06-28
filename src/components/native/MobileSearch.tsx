import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dualApi } from "@/lib/dual-api";
import { RESTAURANTS } from "@/lib/food-data";
import { cartStore } from "@/lib/cart-store";
import { ChevronLeft, Clock, Plus, Search as SearchIcon, Star, Utensils, X } from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

export function MobileSearch({ q, onQueryChange }: { q: string; onQueryChange: (v: string) => void }) {
  const navigate = useNavigate();
  const query = q.trim();

  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => dualApi.listCategories() });
  const resultsQ = useQuery({
    queryKey: ["search", query],
    queryFn: () => dualApi.searchProducts(query),
    enabled: query.length > 0,
  });

  const lower = query.toLowerCase();
  const matchedCats = (catsQ.data ?? []).filter(
    (c) => c.name.toLowerCase().includes(lower) || c.slug.includes(lower),
  );
  const results = resultsQ.data ?? [];

  const foodMatches = useMemo(() => {
    if (!query) return [];
    return RESTAURANTS.filter((r) =>
      r.name.toLowerCase().includes(lower) ||
      r.cuisines.some((c) => c.toLowerCase().includes(lower)) ||
      r.menu.some((d) => d.name.toLowerCase().includes(lower))
    ).slice(0, 4);
  }, [query, lower]);

  const trending = ["Milk", "Bananas", "Bread", "Eggs", "Chips", "Cola", "Curd", "Tomato"];

  return (
    <div className="min-h-screen bg-white pb-32" style={FONT}>
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pt-10 pb-4 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/" })}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={2.5} />
          <input
            autoFocus
            value={q}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products & restaurants…"
            className="w-full rounded-2xl border-none bg-zinc-100 py-3 pl-10 pr-9 text-sm font-medium outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30"
          />
          {q && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-zinc-200 text-zinc-600"
              aria-label="Clear"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      <div className="px-5">
        {!query && (
          <>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Trending</p>
            <div className="flex flex-wrap gap-2">
              {trending.map((t) => (
                <button
                  key={t}
                  onClick={() => onQueryChange(t)}
                  className="rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-bold text-zinc-700"
                >
                  {t}
                </button>
              ))}
            </div>
          </>
        )}

        {query && matchedCats.length > 0 && (
          <div className="mt-2">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Categories</p>
            <div className="flex flex-wrap gap-2">
              {matchedCats.map((c) => (
                <Link
                  key={c.slug}
                  to="/c/$slug"
                  params={{ slug: c.slug }}
                  className="rounded-full bg-zinc-100 px-3.5 py-2 text-xs font-bold text-zinc-700"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {query && foodMatches.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <Utensils className="h-3 w-3 text-orange-500" /> Restaurants
            </p>
            <ul className="space-y-2">
              {foodMatches.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/food/r/$slug"
                    params={{ slug: r.slug }}
                    className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
                  >
                    <img src={r.image} alt="" className="h-14 w-14 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-1 text-sm font-extrabold text-zinc-900">{r.name}</div>
                      <div className="line-clamp-1 text-[11px] text-zinc-500">{r.cuisines.join(" · ")}</div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-zinc-700">
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-green-100 px-1.5 py-0.5 text-green-700">
                          <Star className="h-2.5 w-2.5 fill-current" /> {r.rating}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" /> {r.etaMins}m
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {query && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {resultsQ.isLoading ? "Searching…" : `${results.length} products`}
            </p>
            {results.length > 0 ? (
              <ul className="grid grid-cols-3 gap-2">
                {results.map((p) => (
                  <li
                    key={p.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
                  >
                    <Link to="/p/$id" params={{ id: p.id }} className="block">
                      <div className="aspect-square bg-zinc-50">
                        {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="p-3">
                        <div className="line-clamp-2 text-xs font-bold text-zinc-900">{p.name}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm font-extrabold text-zinc-900">₹{p.price}</div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              cartStore.add(p);
                              toast.success("Added");
                            }}
                            className="grid h-8 w-8 place-items-center rounded-xl text-white"
                            style={{ background: GREEN }}
                            aria-label="Add"
                          >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : !resultsQ.isLoading && (
              <p className="rounded-3xl bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                No products match "{query}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
