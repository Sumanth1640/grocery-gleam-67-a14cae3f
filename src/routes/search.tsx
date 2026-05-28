import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ProductGridSkeleton } from "@/components/site/ProductGridSkeleton";
import { dualApi } from "@/lib/dual-api";
import { RESTAURANTS } from "@/lib/food-data";
import { Search as SearchIcon, SlidersHorizontal, Utensils, Star, Clock } from "lucide-react";

const searchSchema = z.object({ q: z.string().optional().default("") });

type Sort = "relevance" | "price-asc" | "price-desc" | "rating" | "discount";

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ match }) => ({
    meta: [{ title: `Search${match.search.q ? ` "${match.search.q}"` : ""} — hallifresh` }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
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
    ).slice(0, 6);
  }, [query, lower]);


  const [sort, setSort] = useState<Sort>("relevance");
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const maxPrice = useMemo(
    () => results.reduce((m, p) => Math.max(m, p.price), 0) || 1000,
    [results],
  );
  const [priceCap, setPriceCap] = useState<number | null>(null);
  const effectiveCap = priceCap ?? maxPrice;

  const visible = useMemo(() => {
    let list = [...results];
    if (onlyDeals) list = list.filter((p) => p.mrp > p.price);
    if (inStockOnly) list = list.filter((p) => p.in_stock);
    if (minRating > 0) list = list.filter((p) => (p.rating ?? 0) >= minRating);
    list = list.filter((p) => p.price <= effectiveCap);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating": list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case "discount":
        list.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
        break;
    }
    return list;
  }, [results, sort, onlyDeals, inStockOnly, minRating, effectiveCap]);

  const activeFilters = (onlyDeals ? 1 : 0) + (inStockOnly ? 1 : 0) + (minRating > 0 ? 1 : 0) + (priceCap !== null ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => navigate({ search: { q: e.target.value }, replace: true })}
            placeholder='Search "milk", "bananas", "chips"…'
            className="w-full rounded-xl border bg-secondary/40 py-3 pl-9 pr-3 text-sm outline-none focus:bg-background focus:ring-focus"
          />
        </div>

        {!query && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            Start typing to search across products and categories.
          </div>
        )}

        {query && (
          <>
            {matchedCats.length > 0 && (
              <div className="mt-6">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Categories</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {matchedCats.map((c) => (
                    <Link
                      key={c.slug}
                      to="/c/$slug"
                      params={{ slug: c.slug }}
                      className="rounded-full border bg-secondary/40 px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {foodMatches.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Utensils className="h-3.5 w-3.5 text-discount" /> Restaurants & dishes
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {foodMatches.map((r) => (
                    <li key={r.id}>
                      <Link
                        to="/food/r/$slug"
                        params={{ slug: r.slug }}
                        className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card transition hover:bg-secondary"
                      >
                        <img src={r.image} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-1 text-sm font-bold">{r.name}</div>
                          <div className="line-clamp-1 text-[11px] text-muted-foreground">{r.cuisines.join(" · ")}</div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-success/10 px-1.5 py-0.5 text-success">
                              <Star className="h-2.5 w-2.5 fill-current" /> {r.rating}
                            </span>
                            <span className="inline-flex items-center gap-0.5"><Clock className="h-3 w-3" /> {r.etaMins} min</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}



            {results.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-3 py-2 text-xs font-semibold hover:bg-secondary"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters{activeFilters > 0 ? ` · ${activeFilters}` : ""}
                </button>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-focus"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top rated</option>
                  <option value="discount">Biggest discount</option>
                </select>
                {activeFilters > 0 && (
                  <button
                    onClick={() => {
                      setOnlyDeals(false);
                      setInStockOnly(false);
                      setMinRating(0);
                      setPriceCap(null);
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {filtersOpen && results.length > 0 && (
              <div className="mt-3 grid gap-4 rounded-2xl border bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={onlyDeals} onChange={(e) => setOnlyDeals(e.target.checked)} className="h-4 w-4 accent-primary" />
                  On deal only
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
                  In stock only
                </label>
                <div>
                  <div className="mb-1.5 text-xs font-semibold text-muted-foreground">Minimum rating</div>
                  <div className="flex flex-wrap gap-1">
                    {[0, 3, 4, 4.5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                          minRating === r ? "bg-foreground text-background" : "bg-secondary hover:bg-accent"
                        }`}
                      >
                        {r === 0 ? "Any" : `${r}★+`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Max price</span>
                    <span className="text-foreground">₹{effectiveCap}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={10}
                    value={effectiveCap}
                    onChange={(e) => setPriceCap(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-3 text-sm text-muted-foreground">
                {resultsQ.isLoading
                  ? "Searching…"
                  : `${visible.length} result${visible.length === 1 ? "" : "s"} for `}
                {!resultsQ.isLoading && <span className="font-semibold text-foreground">"{q}"</span>}
              </div>
              {resultsQ.isLoading ? (
                <ProductGridSkeleton count={10} />
              ) : visible.length > 0 ? (
                <ProductGrid products={visible} />
              ) : (
                <div className="rounded-2xl border p-10 text-center">
                  <div className="font-display text-lg font-bold">No products found</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {results.length > 0 ? "Try clearing some filters." : "Try a different keyword or browse categories."}
                  </p>
                  <Link to="/" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop">
                    Browse home
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
