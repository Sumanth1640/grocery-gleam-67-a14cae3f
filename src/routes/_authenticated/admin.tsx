import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/catalog.functions";
import { Header } from "@/components/site/Header";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Loader2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — freshcart" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(isAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["is-admin"], queryFn: () => check() });
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto grid max-w-7xl place-items-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-3 font-display text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have admin permissions. Ask an existing admin to grant you the role.
          </p>
          <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/products", label: "Products", icon: Package },
    { to: "/admin/categories", label: "Categories", icon: FolderTree },
    { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Admin</div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Control panel</h1>
          </div>
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Back to store</Link>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2 border-b pb-3">
          {tabs.map((t) => {
            const active = t.exact ? path === t.to : path.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
