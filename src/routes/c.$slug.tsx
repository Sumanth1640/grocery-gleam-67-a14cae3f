import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ProductGridSkeleton } from "@/components/site/ProductGridSkeleton";
import { MobileCategory } from "@/components/native/MobileCategory";
import { listCategories, productsByCategory } from "@/lib/catalog.functions";

type Sort = "popular" | "price-asc" | "price-desc" | "discount";

export const Route = createFileRoute("/c/$slug")({
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      Category not found.
    </div>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cats = useServerFn(listCategories);
  const byCat = useServerFn(productsByCategory);
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => cats() });
  const itemsQ = useQuery({
    queryKey: ["products", "by-cat", slug],
    queryFn: () => byCat({ data: { slug } }),
  });

  const categories = catsQ.data ?? [];
  const items = itemsQ.data ?? [];
  const category = categories.find((c) => c.slug === slug);

  const [sort, setSort] = useState<Sort>("popular");
  const [onlyDeals, setOnlyDeals] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const maxPrice = useMemo(
    () => items.reduce((m, p) => Math.max(m, p.price), 0) || 1000,
    [items],
  );
  const [priceCap, setPriceCap] = useState<number | null>(null);
  const effectiveCap = priceCap ?? maxPrice;

  const visible = useMemo(() => {
    let list = [...items];
    if (onlyDeals) list = list.filter((p) => p.mrp > p.price);
    if (inStockOnly) list = list.filter((p) => p.in_stock);
    if (minRating > 0) list = list.filter((p) => (p.rating ?? 0) >= minRating);
    list = list.filter((p) => p.price <= effectiveCap);
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "discount":
        list.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
        break;
    }
    return list;
  }, [items, sort, onlyDeals, inStockOnly, minRating, effectiveCap]);

  if (catsQ.isSuccess && !category) throw notFound();

  const sortOpts: { id: Sort; label: string }[] = [
    { id: "popular", label: "Popular" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "discount", label: "Biggest Discount" },
  ];

  return (
    <>
      <div className="md:hidden">
        <MobileCategory slug={slug} />
      </div>
      <div className="hidden min-h-screen bg-background md:block">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link> / {category?.name ?? slug}
        </div>
        {category && (
          <div
            className="mt-4 flex items-center gap-4 rounded-2xl border p-5"
            style={{ backgroundColor: category.tint }}
          >
            <img src={category.image} alt={category.name} className="h-20 w-20 rounded-xl object-cover" />
            <div>
              <h1 className="font-display text-2xl font-bold md:text-3xl">{category.name}</h1>
              <p className="text-sm text-foreground/70">{items.length} products · delivery in 11 mins</p>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-[200px_1fr]">
          <aside className="hidden md:block">
            <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Categories</h3>
            <ul className="mt-3 space-y-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/c/$slug"
                    params={{ slug: c.slug }}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${
                      c.slug === slug ? "bg-accent font-semibold" : "hover:bg-secondary"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">Filters</h3>
            <div className="mt-3 space-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => setOnlyDeals(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
                On deal only
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
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

              {(onlyDeals || inStockOnly || minRating > 0 || priceCap !== null) && (
                <button
                  onClick={() => {
                    setOnlyDeals(false);
                    setInStockOnly(false);
                    setMinRating(0);
                    setPriceCap(null);
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </aside>
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{visible.length}</span> of {items.length}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Sort</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold outline-none focus:ring-focus"
                >
                  {sortOpts.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
                <label className="ml-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold md:hidden">
                  <input
                    type="checkbox"
                    checked={onlyDeals}
                    onChange={(e) => setOnlyDeals(e.target.checked)}
                    className="h-3.5 w-3.5 accent-primary"
                  />
                  Deals
                </label>
              </div>
            </div>
            {itemsQ.isLoading ? (
              <ProductGridSkeleton />
            ) : visible.length > 0 ? (
              <ProductGrid products={visible} />
            ) : (
              <div className="rounded-2xl border p-10 text-center text-sm text-muted-foreground">
                No products match your filters.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
