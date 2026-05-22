import { Link } from "@tanstack/react-router";
import logo from "@/assets/hallifresh-logo.jpeg";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="HalliFresh Veggies" className="h-9 w-9 rounded-xl object-cover" />
            <div className="font-display text-lg font-bold">HalliFresh</div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Fresh from farm to home. Hand-picked vegetables and groceries delivered to your door.
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
            <li><Link to="/partner" className="hover:text-foreground">Partner with us</Link></li>
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
        © {new Date().getFullYear()} HalliFresh Veggies. Fresh from farm to home.
      </div>
    </footer>
  );
}
