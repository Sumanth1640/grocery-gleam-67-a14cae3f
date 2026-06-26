import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Shield,
  Store,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { getProfile, listOrders } from "@/lib/account.functions";
import { isAdmin } from "@/lib/catalog.functions";
import { myManagedOutlets } from "@/lib/outlet-managers.functions";
import { signOut, useAuth } from "@/lib/use-auth";
import { NativeHeader } from "./MobileCart";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

export function MobileAccount() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profileFn = useDualFn(getProfile, php.getProfile);
  const ordersFn = useDualFn(listOrders, php.myOrders);
  const adminFn = useDualFn(isAdmin, php.checkRole);

  const { data: profile } = useQuery({ queryKey: ["account-profile"], queryFn: () => profileFn() });
  const { data: orders } = useQuery({ queryKey: ["account-orders"], queryFn: () => ordersFn() });
  const { data: admin } = useQuery({ queryKey: ["is-admin"], queryFn: () => adminFn() });
  const { data: outlets } = useQuery({ queryKey: ["my-outlets"], queryFn: () => myManagedOutlets() });

  const email = user?.email ?? "";
  const initials = (profile?.full_name || email || "U")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const orderCount = Array.isArray(orders) ? orders.length : 0;
  const hasOutlets = Array.isArray(outlets) && outlets.length > 0;
  const isAdminUser = !!(admin && typeof admin === "object" && "isAdmin" in admin && (admin as { isAdmin?: boolean }).isAdmin);
  const isWarehouseManagerUser = !!(admin && typeof admin === "object" && "isWarehouseManager" in admin && (admin as { isWarehouseManager?: boolean }).isWarehouseManager);

  return (
    <div className="min-h-screen bg-zinc-50 pb-36" style={FONT}>
      <NativeHeader title="Profile" />

      {/* Profile card */}
      <div className="px-5">
        <div className="flex items-center gap-4 rounded-[2rem] border border-zinc-100 bg-white p-5 shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[oklch(0.55_0.16_145)]/10 text-[oklch(0.55_0.16_145)] font-display text-xl font-black">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="truncate font-display text-base font-extrabold text-zinc-900">
              {profile?.full_name || "Welcome"}
            </h2>
            <p className="truncate text-xs font-semibold text-zinc-500">{email}</p>
            {profile?.phone && (
              <p className="truncate text-[11px] font-semibold text-zinc-400">{profile.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-3 px-5">
        <Stat label="Orders" value={orderCount} accent="emerald" />
        <Stat label="Wishlist" value="—" accent="orange" />
        <Stat label="Rewards" value="₹0" accent="rose" />
      </div>

      {/* Menu groups */}
      <div className="mt-5 space-y-3 px-5">
        <MenuGroup>
          <MenuItem to="/orders" icon={Package} label="My orders" sub={`${orderCount} order${orderCount === 1 ? "" : "s"}`} />
          <MenuItem to="/settings" icon={MapPin} label="Saved addresses" sub="Home, Work…" />
          <MenuItem to="/wishlist" icon={Heart} label="Wishlist" />
          <MenuItem to="/notifications" icon={Bell} label="Notifications" />
        </MenuGroup>

        {(isAdminUser || isWarehouseManagerUser || hasOutlets) && (
          <MenuGroup>
            {isAdminUser && <MenuItem to="/admin" icon={Shield} label="Admin dashboard" accent />}
            {isWarehouseManagerUser && <MenuItem to="/admin/rider-assignment" icon={Truck} label="Warehouse manager" accent />}
            {hasOutlets && <MenuItem to="/outlet" icon={Store} label="Outlet manager" accent />}
          </MenuGroup>
        )}

        <MenuGroup>
          <MenuItem to="/settings" icon={UserIcon} label="Edit profile" />
          <MenuItem to="/settings" icon={Settings} label="Settings" sub="Preferences, notifications, language" />
          <MenuItem to="/help" icon={Bell} label="Help & support" />
        </MenuGroup>

        <button
          onClick={async () => {
            await signOut();
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-[1.5rem] border border-rose-100 bg-white py-4 text-sm font-extrabold text-rose-600 shadow-sm"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent: "emerald" | "orange" | "rose" }) {
  const tint =
    accent === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : accent === "orange"
      ? "bg-orange-50 text-orange-700"
      : "bg-rose-50 text-rose-700";
  return (
    <div className={`rounded-2xl ${tint} p-3 text-center`}>
      <div className="font-display text-lg font-black">{value}</div>
      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function MenuGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-sm">
      <div className="divide-y divide-zinc-50">{children}</div>
    </div>
  );
}

function MenuItem({
  to,
  icon: Icon,
  label,
  sub,
  accent,
}: {
  to: string;
  icon: any;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3.5">
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl ${
          accent ? "bg-[oklch(0.55_0.16_145)] text-white" : "bg-zinc-100 text-zinc-700"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-extrabold text-zinc-900">{label}</div>
        {sub && <div className="truncate text-[11px] font-semibold text-zinc-400">{sub}</div>}
      </div>
      <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2.5} />
    </Link>
  );
}
