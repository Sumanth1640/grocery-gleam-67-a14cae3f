import { Link, useRouterState } from "@tanstack/react-router";
import { Bike, Heart, Home, ShoppingBag, User, Utensils } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useFoodCart, foodCartTotals } from "@/lib/food-cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/use-auth";
import { useDualFn } from "@/lib/use-dual-fn";
import { riderMe } from "@/lib/rider.functions";
import { php } from "@/lib/php-api";

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

  if (path.startsWith("/p/")) return null;
  if (path === "/checkout" || path.startsWith("/checkout/") || path === "/food/checkout" || path.startsWith("/food/checkout/")) return null;
  // Hide on operator dashboards — they have their own navigation/sticky bars.
  if (
    path === "/rider" || path.startsWith("/rider/") ||
    path === "/warehouse" || path.startsWith("/warehouse/") ||
    path === "/admin" || path.startsWith("/admin/") ||
    path === "/outlet" || path.startsWith("/outlet/") ||
    path === "/partner" || path.startsWith("/partner/")
  ) return null;

  const items = [
    { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    { to: "/food", icon: Utensils, label: "Food", match: (p: string) => p.startsWith("/food"), badge: foodCount },
    { to: "/wishlist", icon: Heart, label: "Wish", match: (p: string) => p.startsWith("/wishlist"), badge: wishCount },
    { to: "/cart", icon: ShoppingBag, label: "Cart", match: (p: string) => p.startsWith("/cart"), badge: itemsCount },
    {
      to: "/account",
      icon: User,
      label: "Me",
      match: (p: string) => p.startsWith("/account") || p.startsWith("/settings") || p.startsWith("/login"),
    },
  ] as const;

  return (
    <>
      <RiderQuickLink path={path} />
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
    </>
  );
}

/**
 * Floating "Rider Dashboard" pill — visible to approved riders on every
 * native screen except /rider itself, so they can always jump back.
 */
function RiderQuickLink({ path }: { path: string }) {
  const { user } = useAuth();
  const meFn = useDualFn(riderMe, () => php.rider.me());
  const meQ = useQuery({
    queryKey: ["rider-me-quicklink", user?.id ?? "anon"],
    queryFn: () => meFn(),
    enabled: !!user,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const status = (meQ.data as { rider?: { status?: string } } | undefined)?.rider?.status;
  if (!user || status !== "approved") return null;
  if (path === "/rider" || path.startsWith("/rider/")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Link
        to="/rider"
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[oklch(0.55_0.16_145)] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/40"
      >
        <Bike className="h-4 w-4" strokeWidth={2.6} />
        Rider Dashboard
      </Link>
    </div>
  );
}
