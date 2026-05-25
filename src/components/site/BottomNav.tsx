import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/use-auth";

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const cart = useCart();
  const wishlist = useWishlist();
  const { itemsCount } = cartTotals(cart);
  const wishCount = Object.keys(wishlist).length;
  const { user } = useAuth();

  const items = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    {
      to: "/search",
      icon: LayoutGrid,
      label: "Categories",
      match: (p: string) => p.startsWith("/c/") || p.startsWith("/search"),
    },
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
      match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout"),
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
    <nav className="fixed inset-x-0 bottom-3 z-40 px-4 md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-3xl border bg-card/95 shadow-app backdrop-blur-md">
        {items.map((it) => {
          const active = it.match(path);
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <Link
                to={it.to as string}
                className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={active ? 2.6 : 2}
                    fill={active && it.label === "Favorites" ? "currentColor" : "none"}
                  />
                  {"badge" in it && (it.badge ?? 0) > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-accent-orange px-1 text-[9px] font-bold text-accent-orange-foreground">
                      {it.badge}
                    </span>
                  )}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
