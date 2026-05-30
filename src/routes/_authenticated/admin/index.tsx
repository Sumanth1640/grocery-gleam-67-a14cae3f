import { createFileRoute } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useQuery } from "@tanstack/react-query";
import { adminStats } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { IndianRupee, Package, FolderTree, ShoppingBag, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fetchStats = useDualFn(adminStats, (d) => php.admin.stats(d));
  const { session, user, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? user?.id ?? "unknown";
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats", userId],
    queryFn: () => fetchStats(),
    enabled: !authLoading && !!session && !!user,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (authLoading || isLoading) {
    return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const cards = [
    { label: "Revenue", value: `₹${(data?.revenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, tint: "bg-primary/10 text-primary" },
    { label: "Orders", value: data?.orders ?? 0, icon: ShoppingBag, tint: "bg-brand/15 text-brand" },
    { label: "Products", value: data?.products ?? 0, icon: Package, tint: "bg-secondary text-foreground" },
    { label: "Categories", value: data?.categories ?? 0, icon: FolderTree, tint: "bg-accent text-foreground" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-2xl border bg-card p-5 shadow-card">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${c.tint}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</div>
            <div className="mt-1 font-display text-2xl font-extrabold">{c.value}</div>
          </div>
        );
      })}
    </div>
  );
}
