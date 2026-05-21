import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, LogOut, Store, UtensilsCrossed, Warehouse } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/use-auth";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, adminOnly: false },
  { to: "/admin/products", label: "Products", icon: Package, exact: false, adminOnly: true },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, exact: false, adminOnly: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false, adminOnly: false },
  { to: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed, exact: false, adminOnly: true },
  { to: "/admin/warehouses", label: "Warehouses", icon: Warehouse, exact: false, adminOnly: true },
] as const;

export function AdminSidebar({ isAdminUser = true }: { isAdminUser?: boolean }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (to: string, exact: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Admin</div>
              <div className="font-display text-sm font-bold">freshcart</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = isActive(it.to, it.exact);
                const Icon = it.icon;
                return (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={it.label}>
                      <Link to={it.to} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{it.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Sign out">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
