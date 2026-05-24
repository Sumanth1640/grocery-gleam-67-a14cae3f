import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, User } from "lucide-react";
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
      to: "/categories",
      icon: LayoutGrid,
      label: "Categories",
      match: (p: string) => p.startsWith("/categories") || p.startsWith("/c/"),
      badge: itemsCount,
    },
    {
      to: "/wishlist",
      icon: Heart,
      label: "Favorites",
      match: (p: string) => p.startsWith("/wishlist"),
      badge: wishCount,
    },
    {
      to: user ? "/account" : "/login",
      icon: User,
      label: "Profile",
      match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
    },
  ] as const;

  // Hide nav on checkout/order-success/auth and any non-customer pages
  const hidden =
    path.startsWith("/checkout") ||
    path.startsWith("/order-success") ||
    path.startsWith("/admin") ||
    path.startsWith("/partner") ||
    path.startsWith("/outlet");
  if (hidden) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="mx-auto max-w-md rounded-[2rem] bg-card shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-border">
        <ul className="grid grid-cols-4 px-2 py-2.5">
          {items.map((it) => {
            const active = it.match(path);
            const Icon = it.icon;
            return (
              <li key={it.label}>
                <Link
                  to={it.to as string}
                  className={`relative mx-1 flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold transition ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span className="relative">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.12 : 0} />
                    {"badge" in it && (it.badge ?? 0) > 0 && (
                      <span className="absolute -right-2.5 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-cta px-1 text-[9px] font-bold text-cta-foreground">
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
      </div>
    </nav>
  );
}
