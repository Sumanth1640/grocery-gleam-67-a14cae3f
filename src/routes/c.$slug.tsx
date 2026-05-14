import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { categories, productsByCategory } from "@/lib/products";

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
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw notFound();
  const items = productsByCategory(slug);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">Home</Link> / {category.name}
        </div>
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
          </aside>
          <div>
            <ProductGrid products={items} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
