import { Link, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingCart, MapPin, ChevronDown, Zap, User as UserIcon, LogIn } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart-store";
import { useAuth } from "@/lib/use-auth";

export function Header() {
  const cart = useCart();
  const { itemsCount, subtotal } = cartTotals(cart);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const onCart = path === "/cart";
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-pop">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="hidden font-display text-lg font-bold leading-none tracking-tight sm:block">
            fresh<span className="text-primary">cart</span>
            <div className="text-[10px] font-medium text-muted-foreground">delivery in 11 mins</div>
          </div>
        </Link>

        <button className="hidden items-center gap-1 rounded-xl border bg-secondary/50 px-3 py-2 text-left text-xs hover:bg-secondary md:flex">
          <MapPin className="h-4 w-4 text-primary" />
          <div>
            <div className="font-semibold">Home</div>
            <div className="text-muted-foreground">221B Baker Street</div>
          </div>
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder='Search "milk", "bananas", "chips"…'
            className="w-full rounded-xl border bg-secondary/40 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:bg-background focus:ring-focus"
          />
        </div>

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
