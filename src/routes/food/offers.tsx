import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { COUPONS, RESTAURANTS } from "@/lib/food-data";
import { Tag, Copy, Check, ArrowRight, Percent, Gift, Flame } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/food/offers")({
  head: () => ({
    meta: [
      { title: "Food offers & coupons — freshcart" },
      { name: "description", content: "Browse the latest food delivery coupons, discounts, and restaurant deals." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const restaurantOffers = RESTAURANTS.filter((r) => r.offer);

  const copy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Copied ${code}`);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-discount/15 via-brand/10 to-primary/10">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-discount px-3 py-1 text-xs font-bold text-white">
            <Gift className="h-3.5 w-3.5" /> Today's deals
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">
            Save big on every<br />food order.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground md:text-base">
            Promo codes, restaurant deals and free delivery — all in one place.
          </p>
        </div>
      </div>

      {/* Coupon codes */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-discount" />
          <h2 className="font-display text-xl font-bold">Promo codes</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COUPONS.map((c) => (
            <div key={c.code} className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition hover:shadow-pop">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-discount/10 blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1 rounded-md bg-discount/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-discount">
                  <Tag className="h-3 w-3" /> {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                </div>
                <div className="mt-3 font-display text-lg font-bold">{c.desc}</div>
                <div className="mt-1 text-xs text-muted-foreground">Min. order ₹{c.minOrder}{c.maxDiscount ? ` · Max ₹${c.maxDiscount}` : ""}</div>

                <div className="mt-4 flex items-stretch gap-2">
                  <div className="flex-1 rounded-xl border-2 border-dashed border-discount/40 bg-discount/5 px-3 py-2.5 font-mono text-sm font-bold tracking-widest text-discount">
                    {c.code}
                  </div>
                  <button
                    onClick={() => copy(c.code)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2.5 text-xs font-bold text-background hover:opacity-90"
                  >
                    {copied === c.code ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Restaurant offers */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-discount" />
          <h2 className="font-display text-xl font-bold">Restaurant deals</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurantOffers.map((r) => (
            <Link
              key={r.id}
              to="/food/r/$slug"
              params={{ slug: r.slug }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:shadow-pop"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={r.image} alt={r.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 inline-flex items-center gap-1 rounded-md bg-discount px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Tag className="h-3 w-3" /> {r.offer}
                </div>
              </div>
              <div className="p-4">
                <div className="font-bold">{r.name}</div>
                <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{r.cuisines.join(" · ")}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Order now <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-brand/10 p-6 text-center shadow-card md:p-10">
          <h3 className="font-display text-2xl font-extrabold">Hungry? Browse all restaurants</h3>
          <p className="mt-1 text-sm text-muted-foreground">Coupons apply automatically at checkout.</p>
          <Link to="/food" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95">
            Explore restaurants <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
