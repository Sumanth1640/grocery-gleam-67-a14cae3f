import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useFurnitureCart, furnitureCart, furnitureTotals } from "@/lib/furniture-cart-store";
import { Minus, Plus, Trash2, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { php } from "@/lib/php-api";
import { toast } from "sonner";

export const Route = createFileRoute("/furniture/cart")({
  head: () => ({
    meta: [
      { title: "Your wishlist — Wooden Furniture" },
      { name: "description", content: "Review pieces and request a tailored quote from our furniture team." },
    ],
  }),
  component: FurnitureCartPage,
});

function FurnitureCartPage() {
  const cart = useFurnitureCart();
  const { lines, count, total } = furnitureTotals(cart);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", pincode: "", message: "" });
  const nav = useNavigate();

  const quote = useMutation({
    mutationFn: () =>
      php.createFurnitureQuote({
        ...form,
        items: lines.map((l) => ({ id: l.id, slug: l.slug, name: l.name, price: l.price, qty: l.qty })),
        total,
      }),
    onSuccess: (r) => {
      setSubmitted(r.id);
      furnitureCart.clear();
      toast.success("Quote request sent — our team will reach out shortly.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link to="/furniture" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to collection
        </Link>

        {submitted ? (
          <div className="mt-10 rounded-3xl border bg-card p-10 text-center shadow-card">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 font-display text-2xl font-extrabold">Quote requested</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference <span className="font-mono">{submitted.slice(0, 8)}</span>. We'll email you a tailored quote within 24 hours.
            </p>
            <button onClick={() => nav({ to: "/furniture" })} className="mt-6 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background">
              Continue browsing
            </button>
          </div>
        ) : count === 0 ? (
          <div className="mt-10 rounded-3xl border bg-card p-10 text-center shadow-card">
            <h1 className="font-display text-2xl font-extrabold">Your wishlist is empty</h1>
            <p className="mt-2 text-sm text-muted-foreground">Add pieces from the collection to request a quote.</p>
            <Link to="/furniture" className="mt-6 inline-block rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background">
              Browse furniture
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
            <div className="space-y-3">
              <h1 className="font-display text-2xl font-extrabold">Your wishlist ({count})</h1>
              {lines.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
                  <img src={l.image} alt={l.name} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.wood} · ₹{l.price.toLocaleString("en-IN")}</div>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-lg border p-0.5">
                      <button onClick={() => furnitureCart.setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                      <button onClick={() => furnitureCart.setQty(l.id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-md hover:bg-secondary">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{(l.price * l.qty).toLocaleString("en-IN")}</div>
                    <button onClick={() => furnitureCart.remove(l.id)} className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Indicative total</div>
                <div className="mt-1 font-display text-3xl font-extrabold">₹{total.toLocaleString("en-IN")}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Buy now with white-glove delivery, or request a tailored quote for customisation.
                </p>
                <Link
                  to="/furniture/checkout"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background shadow-pop"
                >
                  Proceed to checkout
                </Link>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); quote.mutate(); }}
                className="space-y-3 rounded-2xl border bg-card p-5 shadow-card"
              >
                <h3 className="font-display text-lg font-bold">Request a quote</h3>
                <Input label="Your name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                  <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                  <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
                </div>
                <label className="block">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</div>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Customisation, delivery dates, finish preferences…"
                  />
                </label>
                <button
                  type="submit"
                  disabled={quote.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background shadow-pop disabled:opacity-50"
                >
                  {quote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {quote.isPending ? "Sending…" : "Send quote request"}
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Input({
  label, value, onChange, type = "text", required = false,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <input
        type={type}
        required={required}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
