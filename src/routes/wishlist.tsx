import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { useWishlist, wishlistStore } from "@/lib/wishlist-store";
import { cartStore } from "@/lib/cart-store";
import { Heart, Trash2, ShoppingCart, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useIsNative } from "@/lib/use-native";
import { MobileWishlist } from "@/components/native/MobileWishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Your wishlist — hallifresh" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const isNative = useIsNative();
  if (isNative) return <MobileWishlist />;
  return <WebWishlistPage />;
}

function WebWishlistPage() {
  const wishlist = useWishlist();
  const items = Object.values(wishlist);

  const moveAllToCart = () => {
    items.forEach((p) => cartStore.add(p));
    toast.success(`${items.length} item${items.length === 1 ? "" : "s"} added to cart`);
  };

  const share = async () => {
    const ids = items.map((p) => p.slug).join(",");
    const url = `${window.location.origin}/wishlist?items=${encodeURIComponent(ids)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My hallifresh wishlist", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Wishlist link copied");
      }
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-discount" />
            <h1 className="font-display text-2xl font-bold md:text-3xl">Your wishlist</h1>
            <span className="text-sm text-muted-foreground">({items.length})</span>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={moveAllToCart}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-pop hover:opacity-95"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Move all to cart
              </button>
              <button
                onClick={share}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <button
                onClick={() => wishlistStore.clear()}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-card p-10 text-center shadow-card">
            <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-3 font-display text-lg font-bold">Your wishlist is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it for later.</p>
            <Link to="/" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
              Start browsing
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <ProductGrid products={items} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
