import { Link, useNavigate } from "@tanstack/react-router";
import { useWishlist, wishlistStore } from "@/lib/wishlist-store";
import { cartStore } from "@/lib/cart-store";
import { ChevronLeft, Heart, ShoppingBag, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

export function MobileWishlist() {
  const navigate = useNavigate();
  const wishlist = useWishlist();
  const items = Object.values(wishlist);

  const moveAll = () => {
    items.forEach((p) => cartStore.add(p));
    toast.success(`${items.length} item${items.length === 1 ? "" : "s"} added to cart`);
  };

  const share = async () => {
    const url = `${window.location.origin}/wishlist`;
    try {
      if (navigator.share) await navigator.share({ title: "My hallifresh wishlist", url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch { /* dismissed */ }
  };

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
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-zinc-900 leading-none">Wishlist</h1>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">{items.length} saved</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={share}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4 text-zinc-700" />
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <div className="mx-5 mt-16 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
            <Heart className="h-7 w-7 text-rose-400" />
          </div>
          <p className="mt-4 text-base font-extrabold text-zinc-900">Nothing saved yet</p>
          <p className="mt-1 text-xs text-zinc-500">Tap the heart on any product to save it for later.</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-2xl px-5 py-2.5 text-sm font-bold text-white"
            style={{ background: GREEN }}
          >
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="px-5">
            <ul className="grid grid-cols-3 gap-2">
              {items.map((p) => (
                <li
                  key={p.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
                >
                  <Link to="/p/$id" params={{ id: p.id }} className="block">
                    <div className="relative aspect-square bg-zinc-50">
                      {p.image && (
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          wishlistStore.toggle(p);
                        }}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-rose-500 shadow"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="line-clamp-2 text-xs font-bold text-zinc-900">{p.name}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm font-extrabold text-zinc-900">₹{p.price}</div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            cartStore.add(p);
                            toast.success("Added to cart");
                          }}
                          className="grid h-8 w-8 place-items-center rounded-xl text-white"
                          style={{ background: GREEN }}
                          aria-label="Add"
                        >
                          <ShoppingBag className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="fixed inset-x-0 bottom-24 z-30 px-5">
            <div className="flex gap-2 rounded-3xl bg-white p-3 shadow-[0_-4px_30px_rgba(15,23,42,0.1)] ring-1 ring-zinc-100">
              <button
                onClick={() => wishlistStore.clear()}
                className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-700"
                aria-label="Clear"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={moveAll}
                className="flex-1 rounded-2xl py-3 text-sm font-bold text-white"
                style={{ background: GREEN }}
              >
                Move all to cart
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
