import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProduct } from "@/lib/catalog.functions";
import { cartStore, useCart, cartTotals } from "@/lib/cart-store";
import { wishlistStore, useWishlist } from "@/lib/wishlist-store";
import { recentlyViewedStore } from "@/lib/recently-viewed-store";
import { ChevronLeft, ShoppingBasket, Heart, Truck, Leaf, BadgeCheck, Minus, Plus } from "lucide-react";

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
  const navigate = useNavigate();
  const get = useServerFn(getProduct);
  const productQ = useQuery({ queryKey: ["product", id], queryFn: () => get({ data: { slug: id } }) });
  const product = productQ.data;
  const cart = useCart();
  const wishlist = useWishlist();
  const { itemsCount } = cartTotals(cart);

  if (productQ.isSuccess && !product) throw notFound();

  useEffect(() => { if (product) recentlyViewedStore.push(product); }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background px-5 pt-6">
        <div className="aspect-[16/10] animate-pulse rounded-2xl bg-muted" />
        <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const qty = cart[product.id]?.qty ?? 0;
  const wished = !!wishlist[product.id];

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate({ to: "/" })} className="grid h-11 w-11 place-items-center rounded-full bg-card ring-1 ring-border">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-extrabold">Product Details</h1>
          <Link to="/cart" className="relative grid h-11 w-11 place-items-center rounded-full bg-card ring-1 ring-border">
            <ShoppingBasket className="h-[18px] w-[18px]" />
            {itemsCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-cta px-1 text-[10px] font-bold text-cta-foreground">
                {itemsCount}
              </span>
            )}
          </Link>
        </div>

        {/* Image */}
        <div className="mt-5 rounded-2xl bg-[oklch(0.93_0.08_140)] p-6">
          <img src={product.image} alt={product.name} className="mx-auto h-56 w-full object-contain" />
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-5 bg-foreground" : "w-1.5 bg-border"}`} />
          ))}
        </div>

        {/* Title card */}
        <div className="mt-4 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-extrabold">{product.name}</h2>
              <div className="text-sm text-muted-foreground">{product.weight}</div>
            </div>
            <button
              onClick={() => wishlistStore.toggle(product)}
              aria-label="Wishlist"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-[oklch(0.55_0.22_28)] text-[oklch(0.55_0.22_28)]" : "text-muted-foreground"}`} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-2xl font-extrabold text-primary">${product.price}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.9_0.06_240)] text-[oklch(0.45_0.15_240)]">
                <Truck className="h-3.5 w-3.5" />
              </span>
              <span className="text-muted-foreground">Available on fast delivery</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Badge icon={<BadgeCheck className="h-4 w-4 text-[oklch(0.6_0.15_25)]" />} bg="oklch(0.95_0.05_25)" label="Halal Food" />
          <Badge icon={<Leaf className="h-4 w-4 text-[oklch(0.5_0.15_150)]" />} bg="oklch(0.93_0.08_140)" label="Fresh Fruit" />
        </div>

        {/* Description */}
        <div className="mt-4 rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="font-display text-base font-extrabold">Description</div>
          <p className="mt-2 text-sm text-muted-foreground">
            100% satisfaction guarantee. If you experience any of the following issues, missing, poor item, late arrival, unprofessional service…{" "}
            <span className="font-bold text-foreground">Read more</span>
          </p>
        </div>
      </div>

      {/* Sticky bottom add-to-cart */}
      <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-[2rem] bg-card p-3 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-border">
          <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1">
            <button onClick={() => cartStore.remove(product.id)} className="grid h-9 w-9 place-items-center rounded-full bg-card ring-1 ring-border">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-6 text-center text-sm font-extrabold">{qty}</span>
            <button onClick={() => cartStore.add(product)} className="grid h-9 w-9 place-items-center rounded-full bg-card ring-1 ring-border">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => cartStore.add(product)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cta py-3 text-sm font-extrabold text-cta-foreground shadow-pop"
          >
            <ShoppingBasket className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, bg, label }: { icon: React.ReactNode; bg: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
      <span className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: bg }}>
        {icon}
      </span>
      <span className="text-sm font-extrabold">{label}</span>
    </div>
  );
}
