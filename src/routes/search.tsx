import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ProductGridSkeleton } from "@/components/site/ProductGridSkeleton";
import { listCategories, searchProducts } from "@/lib/catalog.functions";
import { Search as SearchIcon } from "lucide-react";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ match }) => ({
    meta: [{ title: `Search${match.search.q ? ` "${match.search.q}"` : ""} — freshcart` }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const query = q.trim();

  const cats = useServerFn(listCategories);
  const search = useServerFn(searchProducts);
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => cats() });
  const resultsQ = useQuery({
    queryKey: ["search", query],
    queryFn: () => search({ data: { q: query } }),
    enabled: query.length > 0,
  });

  const lower = query.toLowerCase();
  const matchedCats = (catsQ.data ?? []).filter(
    (c) => c.name.toLowerCase().includes(lower) || c.slug.includes(lower),
  );
  const results = resultsQ.data ?? [];

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

            <div className="mt-6">
              <div className="mb-3 text-sm text-muted-foreground">
                {resultsQ.isLoading
                  ? "Searching…"
                  : `${results.length} result${results.length === 1 ? "" : "s"} for `}
                {!resultsQ.isLoading && <span className="font-semibold text-foreground">"{q}"</span>}
              </div>
              {resultsQ.isLoading ? (
                <ProductGridSkeleton count={10} />
              ) : results.length > 0 ? (
                <ProductGrid products={results} />
              ) : (
                <div className="rounded-2xl border p-10 text-center">
                  <div className="font-display text-lg font-bold">No products found</div>
                  <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or browse categories.</p>
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
