import { Link } from "@tanstack/react-router";
import { Plus, Minus, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { cartStore, useCart } from "@/lib/cart-store";
import { wishlistStore, useWishlist } from "@/lib/wishlist-store";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const qty = cart[product.id]?.qty ?? 0;
  const wished = !!wishlist[product.id];
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  // Pseudo "best sale" flag — first product alphabetically per batch gets it
  const bestSale = off === 0 && product.id.charCodeAt(0) % 3 === 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-3 shadow-card transition hover:shadow-soft">
      {/* Corner ribbon */}
      {off > 0 ? (
        <div className="absolute left-0 top-0 z-10 rounded-br-xl rounded-tl-2xl bg-discount px-2 py-1 text-center text-[9px] font-extrabold leading-tight text-white shadow-pop">
          {off}%<br />OFF
        </div>
      ) : bestSale ? (
        <div className="absolute left-0 top-0 z-10 rounded-br-xl rounded-tl-2xl bg-[oklch(0.38_0.18_265)] px-2 py-1 text-center text-[9px] font-extrabold leading-tight text-white shadow-pop">
          Best<br />sale
        </div>
      ) : null}

      <button
        onClick={(e) => {
          e.preventDefault();
          wishlistStore.toggle(product);
        }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border bg-background/85 backdrop-blur transition hover:scale-105 ${
          wished ? "text-discount" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-discount" : ""}`} />
      </button>

      <Link
        to="/p/$id"
        params={{ id: product.slug }}
        className="relative block aspect-square overflow-hidden rounded-xl bg-app-surface"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
        />
      </Link>

      <Link
        to="/p/$id"
        params={{ id: product.slug }}
        className="mt-3 line-clamp-1 text-[15px] font-extrabold leading-tight text-foreground"
      >
        {product.name}
      </Link>
      <div className="text-xs text-muted-foreground">{product.weight}</div>

      <div className="mt-auto flex items-end justify-between pt-3">
        <div>
          <div className="text-base font-extrabold text-primary">₹{product.price}</div>
          {off > 0 && (
            <div className="text-[11px] text-muted-foreground line-through">₹{product.mrp}</div>
          )}
        </div>
        {qty === 0 ? (
          <button
            onClick={() => cartStore.add(product)}
            aria-label="Add to cart"
            className="grid h-9 w-9 place-items-center rounded-full bg-accent-orange text-accent-orange-foreground shadow-pop transition hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
          </button>
        ) : (
          <div className="flex items-center gap-1 rounded-full bg-accent-orange text-accent-orange-foreground shadow-pop">
            <button onClick={() => cartStore.remove(product.id)} className="grid h-8 w-8 place-items-center">
              <Minus className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
            <span className="min-w-4 text-center text-xs font-extrabold">{qty}</span>
            <button onClick={() => cartStore.add(product)} className="grid h-8 w-8 place-items-center">
              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
