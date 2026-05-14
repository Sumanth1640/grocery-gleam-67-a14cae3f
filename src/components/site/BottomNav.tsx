import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useAuth } from "@/lib/use-auth";

export function BottomNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const cart = useCart();
  const { itemsCount } = cartTotals(cart);
  const { user } = useAuth();

  const items = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { to: "/search", icon: Search, label: "Search", match: (p: string) => p.startsWith("/search") },
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
      label: user ? "Account" : "Sign in",
      match: (p: string) => p.startsWith("/account") || p.startsWith("/login"),
    },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map((it) => {
          const active = it.match(path);
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <Link
                to={it.to as string}
                className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                  {"badge" in it && (it.badge ?? 0) > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
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
