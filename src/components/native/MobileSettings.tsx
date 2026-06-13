import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronRight,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Moon,
  Package,
  Shield,
  Smartphone,
  Trash2,
  User as UserIcon,
  Star,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, signOut } from "@/lib/use-auth";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import {
  getProfile,
  updateProfile,
  listAddresses,
  deleteAddress,
  setDefaultAddress,
} from "@/lib/account.functions";
import { AddressDialog } from "@/components/site/AddressDialog";
import { NativeHeader } from "./MobileCart";
import { HallifreshLogo } from "./HallifreshLogo";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

const PREFS_KEY = "hallifresh:settings:prefs";

type Prefs = {
  push: boolean;
  email: boolean;
  orderUpdates: boolean;
  darkMode: boolean;
  language: string;
};

const defaultPrefs: Prefs = {
  push: true,
  email: true,
  orderUpdates: true,
  darkMode: false,
  language: "English",
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return defaultPrefs;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

export function MobileSettings() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);

  const updatePref = (k: keyof Prefs, v: any) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50" style={FONT}>
        <NativeHeader title="Settings" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-36" style={FONT}>
        <NativeHeader title="Settings" />
        <div className="px-5">
          <div className="rounded-[2rem] border border-zinc-100 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[oklch(0.55_0.16_145)]/10 text-[oklch(0.55_0.16_145)]">
              <UserIcon className="h-7 w-7" strokeWidth={2.4} />
            </div>
            <h3 className="mt-4 font-display text-lg font-extrabold text-zinc-900">
              Sign in to hallifresh
            </h3>
            <p className="mt-1 text-xs font-semibold text-zinc-500">
              Manage your profile, orders, addresses and preferences.
            </p>
            <button
              onClick={() => navigate({ to: "/login", search: { redirect: "/settings" } })}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[oklch(0.55_0.16_145)] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-100"
            >
              <LogIn className="h-4 w-4" /> Sign in / Sign up
            </button>
          </div>

          <AppearanceAndAbout prefs={prefs} updatePref={updatePref} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-36" style={FONT}>
      <NativeHeader title="Settings" />

      <div className="space-y-4 px-5">
        <ProfileBlock />
        <AddressesBlock />
        <NotificationsBlock prefs={prefs} updatePref={updatePref} />
        <SecurityBlock />
        <AppearanceAndAbout prefs={prefs} updatePref={updatePref} />

        <button
          onClick={async () => {
            await signOut();
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[1.5rem] border border-rose-100 bg-white py-4 text-sm font-extrabold text-rose-600 shadow-sm"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 ml-1 text-[11px] font-black uppercase tracking-[0.15em] text-zinc-400">
      {children}
    </h3>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-sm">
      <div className="divide-y divide-zinc-50">{children}</div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  sub,
  right,
  to,
  onClick,
  accent,
}: {
  icon: any;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  to?: string;
  onClick?: () => void;
  accent?: boolean;
}) {
  const inside = (
    <>
      <div
        className={`grid h-10 w-10 place-items-center rounded-2xl ${
          accent
            ? "bg-[oklch(0.55_0.16_145)] text-white"
            : "bg-zinc-100 text-zinc-700"
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-extrabold text-zinc-900">{label}</div>
        {sub && (
          <div className="truncate text-[11px] font-semibold text-zinc-400">{sub}</div>
        )}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-zinc-300" strokeWidth={2.5} />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className="flex items-center gap-3 px-4 py-3.5">
        {inside}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      {inside}
    </button>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${
        on ? "bg-[oklch(0.55_0.16_145)]" : "bg-zinc-200"
      }`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function ProfileBlock() {
  const { user } = useAuth();
  const fetchProfile = useDualFn(getProfile, () => php.getProfile());
  const updateFn = useDualFn(updateProfile, (d: any) => php.updateProfile(d));
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const startEdit = () => {
    setName(data?.full_name ?? "");
    setPhone(data?.phone ?? "");
    setOpen(true);
  };

  const mut = useMutation({
    mutationFn: (vars: { full_name: string; phone: string }) => updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["account-profile"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const initials = (data?.full_name || user?.email || "U")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <SectionTitle>Profile</SectionTitle>
      <div className="overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-sm">
        <div className="flex items-center gap-4 p-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[oklch(0.55_0.16_145)]/10 text-[oklch(0.55_0.16_145)] font-display text-lg font-black">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-extrabold text-zinc-900">
              {isLoading ? "…" : data?.full_name || "Add your name"}
            </div>
            <div className="truncate text-[11px] font-semibold text-zinc-400">
              {user?.email}
            </div>
            {data?.phone && (
              <div className="truncate text-[11px] font-semibold text-zinc-400">
                +91 {data.phone}
              </div>
            )}
          </div>
          <button
            onClick={startEdit}
            className="rounded-xl bg-[oklch(0.55_0.16_145)] px-3 py-1.5 text-[11px] font-extrabold text-white"
          >
            Edit
          </button>
        </div>
        <div className="divide-y divide-zinc-50 border-t border-zinc-50">
          <Row icon={Package} label="My orders" to="/orders" />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-end">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate({ full_name: name.trim(), phone: phone.trim() });
            }}
            className="relative w-full rounded-t-[2rem] bg-white p-5 shadow-2xl animate-fade-in"
            style={FONT}
          >
            <h3 className="font-display text-lg font-extrabold text-zinc-900">
              Edit profile
            </h3>
            <label className="mt-4 block">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                Full name
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30"
              />
            </label>
            <label className="mt-3 block">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                Phone
              </div>
              <input
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                inputMode="numeric"
                placeholder="9876543210"
                className="w-full rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30"
              />
            </label>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-2xl border border-zinc-200 py-3 text-sm font-extrabold text-zinc-700"
              >
                Cancel
              </button>
              <button
                disabled={mut.isPending}
                className="flex-1 rounded-2xl bg-[oklch(0.55_0.16_145)] py-3 text-sm font-extrabold text-white disabled:opacity-60"
              >
                {mut.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function AddressesBlock() {
  const fetchAddrs = useDualFn(listAddresses, () => php.addresses());
  const deleteFn = useDualFn(deleteAddress, (d: any) => php.deleteAddress(d.id));
  const setDefaultFn = useDualFn(setDefaultAddress, (d: any) =>
    php.setDefaultAddress(d.id),
  );
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => fetchAddrs(),
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Address removed");
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
  const setDefault = useMutation({
    mutationFn: (id: string) => setDefaultFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Default updated");
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return (
    <>
      <SectionTitle>Saved addresses</SectionTitle>
      <div className="overflow-hidden rounded-[1.5rem] border border-zinc-100 bg-white shadow-sm">
        <div className="divide-y divide-zinc-50">
          {isLoading ? (
            <div className="p-4 text-xs text-zinc-400">Loading…</div>
          ) : !data || data.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">No addresses yet.</div>
          ) : (
            data.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                    {a.full_name}
                    <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-600">
                      {a.type}
                    </span>
                    {a.is_default && (
                      <span className="rounded-full bg-[oklch(0.55_0.16_145)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[oklch(0.55_0.16_145)]">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="line-clamp-2 text-[11px] font-medium text-zinc-500">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {!a.is_default && (
                    <button
                      onClick={() => setDefault.mutate(a.id)}
                      className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-100 text-zinc-500"
                      aria-label="Set default"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => del.mutate(a.id)}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[oklch(0.55_0.16_145)] text-white">
              <Plus className="h-4 w-4" strokeWidth={2.6} />
            </div>
            <span className="flex-1 text-sm font-extrabold text-[oklch(0.55_0.16_145)]">
              Add new address
            </span>
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </button>
        </div>
      </div>

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
      />
    </>
  );
}

function NotificationsBlock({
  prefs,
  updatePref,
}: {
  prefs: Prefs;
  updatePref: (k: keyof Prefs, v: any) => void;
}) {
  return (
    <>
      <SectionTitle>Notifications</SectionTitle>
      <Group>
        <Row
          icon={Bell}
          label="Push notifications"
          sub="Order alerts on your device"
          right={
            <Toggle on={prefs.push} onChange={(v) => updatePref("push", v)} />
          }
        />
        <Row
          icon={Smartphone}
          label="Email updates"
          sub="Receipts and promotions"
          right={
            <Toggle on={prefs.email} onChange={(v) => updatePref("email", v)} />
          }
        />
        <Row
          icon={Package}
          label="Order status"
          sub="Out for delivery, delivered"
          right={
            <Toggle
              on={prefs.orderUpdates}
              onChange={(v) => updatePref("orderUpdates", v)}
            />
          }
        />
      </Group>
    </>
  );
}

function SecurityBlock() {
  return (
    <>
      <SectionTitle>App & security</SectionTitle>
      <Group>
        <Row
          icon={Lock}
          label="Change password"
          onClick={() =>
            toast.info("Password reset link will be sent to your email")
          }
        />
        <Row
          icon={Shield}
          label="Privacy policy"
          onClick={() =>
            window.open("https://hallifresh.in/privacy", "_blank", "noopener")
          }
        />
        <Row
          icon={Trash2}
          label="Delete account"
          sub="Permanently remove your data"
          onClick={() =>
            toast.error("Contact support to delete your account", {
              description: "support@hallifresh.in",
            })
          }
        />
      </Group>
    </>
  );
}

function AppearanceAndAbout({
  prefs,
  updatePref,
}: {
  prefs: Prefs;
  updatePref: (k: keyof Prefs, v: any) => void;
}) {
  return (
    <>
      <SectionTitle>App preferences</SectionTitle>
      <Group>
        <Row
          icon={Moon}
          label="Dark mode"
          sub="Coming soon"
          right={
            <Toggle
              on={prefs.darkMode}
              onChange={(v) => {
                updatePref("darkMode", v);
                toast.info("Dark mode is coming soon");
              }}
            />
          }
        />
        <Row
          icon={Globe}
          label="Language"
          sub={prefs.language}
          onClick={() => toast.info("More languages coming soon")}
        />
      </Group>

      <div className="h-2" />
      <SectionTitle>Help & about</SectionTitle>
      <Group>
        <Row icon={HelpCircle} label="Help center" to="/help" />
        <Row icon={Info} label="Support" to="/support" />
        <Row
          icon={Info}
          label="Terms of service"
          onClick={() =>
            window.open("https://hallifresh.in/terms", "_blank", "noopener")
          }
        />
      </Group>

      <div className="mt-5 flex flex-col items-center gap-2 py-4 opacity-80">
        <HallifreshLogo size="sm" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          v1.0.0 • Made with care
        </p>
      </div>
    </>
  );
}
