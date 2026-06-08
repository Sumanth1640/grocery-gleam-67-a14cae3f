import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, ShoppingBag, User, Utensils } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useFoodCart, foodCartTotals } from "@/lib/food-cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/use-auth";

/**
 * Premium dark-dock bottom navigation used in the Capacitor native shell.
 * Floating pill, dark surface, active icon gets a green pill background.
 */
export function NativeBottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const cart = useCart();
  const foodCart = useFoodCart();
  const wishlist = useWishlist();
  const { itemsCount } = cartTotals(cart);
  const foodCount = foodCartTotals(foodCart).itemsCount;
  const wishCount = Object.keys(wishlist).length;
  const { user } = useAuth();

  if (path.startsWith("/p/")) return null;

  const items = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { to: "/food", icon: Utensils, label: "Food", match: (p: string) => p.startsWith("/food"), badge: foodCount },
    { to: "/wishlist", icon: Heart, label: "Wish", match: (p: string) => p.startsWith("/wishlist"), badge: wishCount },
    { to: "/cart", icon: ShoppingBag, label: "Cart", match: (p: string) => p.startsWith("/cart"), badge: itemsCount },
    {
      to: user ? "/account" : "/login",
      icon: User,
      label: "Me",
      match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
    },
  ] as const;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-5 pb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-around rounded-[2.5rem] bg-zinc-900 px-2 py-2.5 shadow-2xl shadow-black/40">
        {items.map((it) => {
          const active = it.match(path);
          const Icon = it.icon;
          const badge = "badge" in it ? it.badge ?? 0 : 0;
          return (
            <Link
              key={it.label}
              to={it.to as string}
              aria-label={it.label}
              className="relative grid h-12 w-12 place-items-center"
            >
              {active ? (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[oklch(0.55_0.16_145)] text-white shadow-lg shadow-emerald-500/40">
                  <Icon className="h-5 w-5" strokeWidth={2.4} />
                </span>
              ) : (
                <Icon className="h-6 w-6 text-zinc-400" strokeWidth={2} />
              )}
              {badge > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full border-2 border-zinc-900 bg-orange-500 px-1 text-[9px] font-black leading-none text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
