import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { isAdmin } from "@/lib/catalog.functions";
import { useAuth } from "@/lib/use-auth";
import { Loader2, ShieldAlert } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOrderAlerts, AdminOrderAlertsControl } from "@/components/admin/OrderAlerts";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — hallifresh" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(isAdmin);
  const { session, loading: authLoading } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin", session?.user.id],
    queryFn: () => check(),
    enabled: !authLoading && !!session,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (authLoading || isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allowed = !!(data?.isAdmin || data?.isWarehouseManager);
  if (!allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-3 font-display text-2xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You don't have admin permissions. Ask an existing admin to grant you the role.
          </p>
          <Link to="/login" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
            Sign in as another user
          </Link>
        </div>
      </div>
    );
  }

  const title =
    path === "/admin"
      ? "Dashboard"
      : path.startsWith("/admin/products")
      ? "Products"
      : path.startsWith("/admin/categories")
      ? "Categories"
      : path.startsWith("/admin/orders")
      ? "Orders"
      : "Admin";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar isAdminUser={!!data?.isAdmin} />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Admin</div>
              <h1 className="font-display text-base font-bold leading-tight">{title}</h1>
            </div>
            <AdminOrderAlertsControl />
          </header>
          <AdminOrderAlerts />
          <main className="flex-1 px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
