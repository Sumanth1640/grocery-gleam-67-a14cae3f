import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, ShoppingCart, User, Utensils } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useFoodCart, foodCartTotals } from "@/lib/food-cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/use-auth";

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const cart = useCart();
  const foodCart = useFoodCart();
  const wishlist = useWishlist();
  const { itemsCount } = cartTotals(cart);
  const foodCount = foodCartTotals(foodCart).itemsCount;
  const wishCount = Object.keys(wishlist).length;
  const { user } = useAuth();

  const items = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { to: "/food", icon: Utensils, label: "Food", match: (p: string) => p.startsWith("/food"), badge: foodCount },
    {
      to: "/wishlist",
      icon: Heart,
      label: "Favorites",
      match: (p: string) => p.startsWith("/wishlist"),
      badge: wishCount,
    },
    {
      to: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      match: (p: string) => p.startsWith("/cart"),
      badge: itemsCount,
    },
    {
      to: user ? "/account" : "/login",
      icon: User,
      label: "Profile",
      match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
    },
  ] as const;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-4 md:hidden">
      <ul className="pointer-events-auto mx-auto flex max-w-md items-center justify-between rounded-[28px] border border-border/40 bg-card/95 px-2 py-2 shadow-pop backdrop-blur-xl">
        {items.map((it) => {
          const active = it.match(path);
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex-1">
              <Link
                to={it.to as string}
                className={`relative mx-auto flex h-12 items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-pop"
                    : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.6 : 2.2} />
                  {"badge" in it && (it.badge ?? 0) > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[oklch(0.6_0.22_25)] px-1 text-[9px] font-bold text-white">
                      {it.badge}
                    </span>
                  )}
                </span>
                {active && <span className="leading-none">{it.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
