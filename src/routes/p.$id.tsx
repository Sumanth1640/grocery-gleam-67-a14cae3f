import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ProductGridSkeleton } from "@/components/site/ProductGridSkeleton";
import { getProduct, productsByCategory } from "@/lib/catalog.functions";
import { cartStore, useCart } from "@/lib/cart-store";
import { Clock, Minus, Plus, ShieldCheck, Truck, Leaf } from "lucide-react";

export const Route = createFileRoute("/p/$id")({
  component: ProductPage,
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      Product not found.
    </div>
  ),
});

function ProductPage() {
  const { id } = Route.useParams();
  const get = useServerFn(getProduct);
  const byCat = useServerFn(productsByCategory);
  const productQ = useQuery({ queryKey: ["product", id], queryFn: () => get({ data: { slug: id } }) });

  const product = productQ.data;
  const relatedQ = useQuery({
    queryKey: ["products", "by-cat", product?.category_slug],
    queryFn: () => byCat({ data: { slug: product!.category_slug } }),
    enabled: !!product,
  });

  if (productQ.isSuccess && !product) throw notFound();

  const cart = useCart();

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
            <div className="space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-10 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const qty = cart[product.id]?.qty ?? 0;
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const related = (relatedQ.data ?? []).filter((p) => p.id !== product.id).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-xs text-muted-foreground">
          <Link to="/">Home</Link> /{" "}
          <Link to="/c/$slug" params={{ slug: product.category_slug }}>{product.category_slug}</Link> / {product.name}
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border bg-secondary/40 p-6">
            <img src={product.image} alt={product.name} className="aspect-square w-full rounded-2xl object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-brand-foreground">
              <Clock className="h-3 w-3" /> {product.eta}
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{product.name}</h1>
            <div className="mt-1 text-sm text-muted-foreground">{product.weight}</div>

            <div className="mt-5 flex items-end gap-3">
              <div className="text-3xl font-extrabold">₹{product.price}</div>
              {off > 0 && (
                <>
                  <div className="text-base text-muted-foreground line-through">₹{product.mrp}</div>
                  <div className="rounded-md bg-discount/10 px-2 py-0.5 text-xs font-bold text-discount">{off}% OFF</div>
                </>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">(Inclusive of all taxes)</div>

            <div className="mt-6 flex items-center gap-3">
              {qty === 0 ? (
                <button
                  onClick={() => cartStore.add(product)}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop transition hover:opacity-95"
                >
                  Add to cart
                </button>
              ) : (
                <div className="flex items-center gap-1 rounded-xl bg-primary text-primary-foreground">
                  <button onClick={() => cartStore.remove(product.id)} className="grid h-11 w-11 place-items-center">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-6 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => cartStore.add(product)} className="grid h-11 w-11 place-items-center">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Link to="/cart" className="rounded-xl border bg-background px-5 py-3 text-sm font-bold hover:bg-secondary">
                Go to cart
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs">
              <Perk icon={<Truck className="h-4 w-4" />} label="Fast delivery" />
              <Perk icon={<Leaf className="h-4 w-4" />} label="Hand-picked" />
              <Perk icon={<ShieldCheck className="h-4 w-4" />} label="Quality assured" />
            </div>

            <div className="mt-8 rounded-2xl border bg-card p-5">
              <h3 className="text-sm font-bold">Why you'll love it</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sourced fresh and stored in temperature-controlled warehouses. Delivered straight from store to your door, often in under 15 minutes.
              </p>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">You might also like</h2>
          <div className="mt-5">
            {relatedQ.isLoading ? <ProductGridSkeleton count={5} /> : related.length > 0 && <ProductGrid products={related} />}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3">
      <span className="text-primary">{icon}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}
