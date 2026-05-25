import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, ShoppingCart, User as UserIcon, LogIn, Heart, Utensils, Bell } from "lucide-react";
import logo from "@/assets/hallifresh-logo.jpeg";
import { DeliveryAddressChip } from "@/components/site/DeliveryAddressChip";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useAuth } from "@/lib/use-auth";
import { useIsNative } from "@/lib/use-native";
import { unreadCount } from "@/lib/notifications.functions";

export function Header() {
  const isNative = useIsNative();
  const cart = useCart();
  const wishlist = useWishlist();
  const wishCount = Object.keys(wishlist).length;
  const { itemsCount, subtotal } = cartTotals(cart);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const onCart = path === "/cart";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const unreadFn = useServerFn(unreadCount);
  const unreadQ = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => unreadFn(),
    enabled: !!user,
    refetchInterval: 60_000,
  });
  const unread = unreadQ.data?.count ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:gap-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="HalliFresh Veggies" className="h-10 w-10 rounded-xl object-cover shadow-pop" />
          <div className="hidden font-display text-lg font-bold leading-none tracking-tight sm:block">
            Halli<span className="text-primary">Fresh</span>
            <div className="text-[10px] font-medium text-muted-foreground">Fresh from Farm to Home</div>
          </div>
        </Link>

        <DeliveryAddressChip className="hidden md:flex" />

        <Link
          to="/food"
          className="hidden items-center gap-1.5 rounded-xl border bg-discount/10 px-3 py-2 text-xs font-bold text-discount hover:bg-discount/15 lg:flex"
        >
          <Utensils className="h-3.5 w-3.5" /> Food
        </Link>

        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/search", search: { q } });
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search "milk", "bananas", "chips"…'
            className="w-full rounded-xl border bg-secondary/40 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:bg-background focus:ring-focus"
          />
        </form>

        {!loading && (user ? (
          <Link
            to="/account"
            className="hidden items-center gap-2 rounded-xl border bg-secondary/40 px-3 py-2 text-xs font-semibold hover:bg-secondary sm:flex"
          >
            <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {(user.user_metadata?.full_name || user.email || "U").slice(0, 1).toUpperCase()}
            </div>
            Account
          </Link>
        ) : (
          <Link
            to="/login"
            className="hidden items-center gap-1.5 rounded-xl border bg-secondary/40 px-3 py-2 text-xs font-semibold hover:bg-secondary sm:flex"
          >
            <LogIn className="h-3.5 w-3.5" /> Sign in
          </Link>
        ))}

        {/* mobile: account icon */}
        {!loading && (
          <Link
            to={user ? "/account" : "/login"}
            className="grid h-10 w-10 place-items-center rounded-xl border bg-secondary/40 hover:bg-secondary sm:hidden"
            aria-label={user ? "Account" : "Sign in"}
          >
            <UserIcon className="h-4 w-4" />
          </Link>
        )}

        <Link
          to="/wishlist"
          aria-label="Wishlist"
          className="relative hidden h-10 w-10 place-items-center rounded-xl border bg-secondary/40 hover:bg-secondary sm:grid"
        >
          <Heart className={`h-4 w-4 ${wishCount > 0 ? "fill-discount text-discount" : ""}`} />
          {wishCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-discount px-1 text-[9px] font-bold text-white">
              {wishCount}
            </span>
          )}
        </Link>

        {user && (
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative hidden h-10 w-10 place-items-center rounded-xl border bg-secondary/40 hover:bg-secondary sm:grid"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </Link>
        )}



        <Link
          to="/cart"
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            itemsCount > 0
              ? "bg-primary text-primary-foreground hover:opacity-95"
              : "bg-secondary text-foreground hover:bg-accent"
          } ${onCart ? "ring-focus" : ""}`}
        >
          <ShoppingCart className="h-4 w-4" />
          {itemsCount > 0 ? (
            <span className="hidden sm:inline">
              {itemsCount} item{itemsCount > 1 ? "s" : ""} · ₹{subtotal}
            </span>
          ) : (
            <span className="hidden sm:inline">My cart</span>
          )}
          {itemsCount > 0 && <span className="sm:hidden">{itemsCount}</span>}
        </Link>
      </div>
    </header>
  );
}
