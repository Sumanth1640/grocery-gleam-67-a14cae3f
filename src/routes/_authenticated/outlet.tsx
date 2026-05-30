import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { Loader2, Store, LayoutDashboard, ShoppingBag, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { myManagedOutlets } from "@/lib/outlet-managers.functions";

export const Route = createFileRoute("/_authenticated/outlet")({
  head: () => ({ meta: [{ title: "Outlet panel — hallifresh" }] }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login", search: { redirect: location.href } });
  },
  component: OutletLayout,
});

const NAV = [
  { to: "/outlet", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/outlet/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { to: "/outlet/menu", label: "Menu", icon: UtensilsCrossed, exact: false },
] as const;

function OutletLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const fn = useDualFn(myManagedOutlets, (d) => php.outletMgr.myManagedOutlets(d));
  const q = useQuery({ queryKey: ["my-managed-outlets"], queryFn: () => fn() });
  const isActive = (to: string, exact: boolean) => (exact ? path === to : path === to || path.startsWith(to + "/"));

  if (q.isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }
  const outlets = q.data ?? [];
  if (!outlets.length) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
          <Store className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-xl font-bold">No outlets assigned</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask your restaurant owner to assign you to an outlet.</p>
          <Link to="/" className="mt-5 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Go home</Link>
        </div>
      </div>
    );
  }

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
              Outlet panel
              <div className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                {outlets.length === 1 ? outlets[0].outlet?.name : `${outlets.length} outlets`}
              </div>
            </div>
          </div>
        </div>
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
