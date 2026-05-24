import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { cartTotals, useCart } from "@/lib/cart-store";
import { ShoppingBasket } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — hallifresh" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { itemsCount } = cartTotals(cart);
  const navigate = useNavigate();

  if (itemsCount === 0) {
    return (
      <div className="min-h-screen bg-background pb-28">
        <div className="mx-auto grid max-w-md place-items-center px-5 py-24 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-muted">
            <ShoppingBasket className="h-9 w-9 text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold">Your cart is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">Add fresh groceries and they'll show up here.</p>
          <Link to="/" className="mt-6 rounded-full bg-cta px-6 py-3 text-sm font-extrabold text-cta-foreground shadow-pop">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  // Route directly to checkout — single-screen mobile flow
  if (typeof window !== "undefined") {
    navigate({ to: "/checkout", replace: true });
  }
  return null;
}

// Suppress unused-import warnings in case of SSR pre-redirect (Header/Footer no longer used)
void Header; void Footer;
