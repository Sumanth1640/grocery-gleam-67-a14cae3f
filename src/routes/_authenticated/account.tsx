import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  getProfile,
  updateProfile,
  listAddresses,
  deleteAddress,
  listOrders,
} from "@/lib/account.functions";
import { signOut } from "@/lib/use-auth";
import { findProduct } from "@/lib/products";
import { LogOut, MapPin, Package, Plus, Trash2, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Your account — freshcart" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold md:text-3xl">Your account</h1>
          <button
            onClick={async () => {
              await signOut();
              toast.success("Signed out");
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <ProfileCard />
          <AddressesCard />
        </div>
        <div className="mt-5">
          <OrdersCard />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }: { icon: typeof MapPin; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-bold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ProfileCard() {
  const fetchProfile = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (data && !edited) {
      setName(data.full_name ?? "");
      setPhone(data.phone ?? "");
    }
  }, [data, edited]);

  const mut = useMutation({
    mutationFn: (vars: { full_name: string; phone: string }) => updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
      setEdited(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <SectionHeader icon={UserIcon} title="Profile" />
      {isLoading ? (
        <div className="grid h-24 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate({ full_name: name.trim(), phone: phone.trim() });
          }}
          className="mt-3 space-y-3"
        >
          <Field label="Full name">
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setEdited(true); }}
              className={inputCls}
              required
            />
          </Field>
          <Field label="Phone (10 digits)">
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setEdited(true); }}
              inputMode="numeric"
              className={inputCls}
              placeholder="9876543210"
            />
          </Field>
          <button
            disabled={mut.isPending || !edited}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50"
          >
            {mut.isPending ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}

function AddressesCard() {
  const fetchAddrs = useServerFn(listAddresses);
  const deleteFn = useServerFn(deleteAddress);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["addresses"], queryFn: () => fetchAddrs() });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Address removed");
      qc.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <SectionHeader
        icon={MapPin}
        title="Saved addresses"
        action={
          <Link to="/checkout" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus className="h-3 w-3" /> Add via checkout
          </Link>
        }
      />
      {isLoading ? (
        <div className="grid h-24 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : !data || data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No saved addresses yet. Add one when you check out.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {data.map((a) => (
            <li key={a.id} className="rounded-xl border bg-secondary/30 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {a.full_name}
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{a.type}</span>
                    {a.is_default && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Default</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}
                  </div>
                  <div className="text-xs text-muted-foreground">+91 {a.phone}</div>
                </div>
                <button
                  onClick={() => del.mutate(a.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrdersCard() {
  const fetchOrders = useServerFn(listOrders);
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => fetchOrders() });

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <SectionHeader icon={Package} title="Recent orders" />
      {isLoading ? (
        <div className="grid h-24 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : !data || data.length === 0 ? (
        <div className="mt-4 text-sm text-muted-foreground">
          No orders yet.{" "}
          <Link to="/" className="font-semibold text-primary hover:underline">Start shopping →</Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y">
          {data.map((o) => {
            const items = (o.items as unknown as { product: { id: string; name: string }; qty: number }[]) ?? [];
            const first = items[0];
            const firstProduct = first ? findProduct(first.product.id) : undefined;
            const moreCount = Math.max(0, items.length - 1);
            return (
              <li key={o.id} className="flex items-center gap-3 py-3">
                {firstProduct && (
                  <img src={firstProduct.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">{o.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
                  </div>
                  <div className="line-clamp-1 text-sm font-semibold">
                    {first?.product.name}
                    {moreCount > 0 && <span className="text-muted-foreground"> + {moreCount} more</span>}
                  </div>
                </div>
                <div className="text-sm font-bold">₹{o.total}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-focus";
