import { Link } from "@tanstack/react-router";
import { Plus, Minus, Clock, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { cartStore, useCart } from "@/lib/cart-store";
import { wishlistStore, useWishlist } from "@/lib/wishlist-store";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const qty = cart[product.id]?.qty ?? 0;
  const wished = !!wishlist[product.id];
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-3 shadow-card transition hover:shadow-soft">
      {off > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-discount px-1.5 py-0.5 text-[10px] font-bold text-white">
          {off}% OFF
        </div>
      )}
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
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden rounded-xl bg-secondary/60"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
        <Clock className="h-3 w-3" /> {product.eta}
      </div>
      <Link to="/p/$id" params={{ id: product.id }} className="mt-1 line-clamp-2 text-sm font-semibold leading-tight">
        {product.name}
      </Link>
      <div className="text-xs text-muted-foreground">{product.weight}</div>

      <div className="mt-auto flex items-end justify-between pt-3">
        <div>
          <div className="text-sm font-bold">₹{product.price}</div>
          {off > 0 && (
            <div className="text-[11px] text-muted-foreground line-through">₹{product.mrp}</div>
          )}
        </div>
        {qty === 0 ? (
          <button
            onClick={() => cartStore.add(product)}
            className="rounded-lg border-2 border-primary px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground">
            <button onClick={() => cartStore.remove(product.id)} className="grid h-7 w-7 place-items-center">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-4 text-center text-xs font-bold">{qty}</span>
            <button onClick={() => cartStore.add(product)} className="grid h-7 w-7 place-items-center">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
