import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div className="font-display text-lg font-bold">freshcart</div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Groceries delivered in minutes. Fresh, fast, and hand-picked.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/c/$slug" params={{ slug: "fruits" }}>Fruits</Link></li>
            <li><Link to="/c/$slug" params={{ slug: "vegetables" }}>Vegetables</Link></li>
            <li><Link to="/c/$slug" params={{ slug: "dairy" }}>Dairy & Eggs</Link></li>
            <li><Link to="/c/$slug" params={{ slug: "snacks" }}>Snacks</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About</li>
            <li>Careers</li>
            <li>Press</li>
            <li>Partner with us</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/help" className="hover:text-foreground">Customer support</Link></li>
            <li><Link to="/help" className="hover:text-foreground">Delivery areas</Link></li>
            <li><Link to="/help" className="hover:text-foreground">Refund policy</Link></li>
            <li><Link to="/help" className="hover:text-foreground">Terms & privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} freshcart. Crafted with care.
      </div>
    </footer>
  );
}
