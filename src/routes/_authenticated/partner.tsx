import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Store, LayoutDashboard, UtensilsCrossed, ShoppingBag, Settings, ArrowLeft, MapPin } from "lucide-react";
import { OrderAlerts, OrderAlertsControl } from "@/components/partner/OrderAlerts";

export const Route = createFileRoute("/_authenticated/partner")({
  head: () => ({ meta: [{ title: "Partner portal — freshcart" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  component: PartnerLayout,
});

const NAV = [
  { to: "/partner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/partner/profile", label: "Profile", icon: Settings, exact: false },
  { to: "/partner/menu", label: "Menu", icon: UtensilsCrossed, exact: false },
  { to: "/partner/outlets", label: "Outlets", icon: MapPin, exact: false },
  { to: "/partner/orders", label: "Orders", icon: ShoppingBag, exact: false },
] as const;

function PartnerLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (to: string, exact: boolean) => (exact ? path === to : path === to || path.startsWith(to + "/"));
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to site
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Store className="h-3.5 w-3.5" /></div>
            <div className="font-display text-sm font-bold leading-none">
              Partner portal
              <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">Manage your restaurant</div>
            </div>
          </div>
          <OrderAlertsControl />
        </div>
        <OrderAlerts />
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((n) => {
            const active = isActive(n.to, n.exact);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                <Icon className="h-3.5 w-3.5" /> {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
