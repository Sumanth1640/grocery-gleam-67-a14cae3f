import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ArrowRight, Trees, Hammer, Truck, Leaf } from "lucide-react";
import {
  furnitureCategories,
  furnitureItems,
  type FurnitureItem,
} from "@/lib/furniture-data";

export const Route = createFileRoute("/furniture/")({
  head: () => ({
    meta: [
      { title: "Wooden Furniture — Handcrafted Solid Wood Pieces" },
      {
        name: "description",
        content:
          "Shop handcrafted wooden furniture in teak, sheesham, mango, oak and walnut. Sofas, beds, dining sets and storage built to last.",
      },
      { property: "og:title", content: "Wooden Furniture — Handcrafted Solid Wood" },
      {
        property: "og:description",
        content: "Solid wood sofas, beds, dining sets and storage — handcrafted to order.",
      },
    ],
  }),
  component: FurnitureLanding,
});

function FurnitureLanding() {
  const [cat, setCat] = useState<string>("all");
  const items = useMemo(
    () => (cat === "all" ? furnitureItems : furnitureItems.filter((i) => i.category === cat)),
    [cat],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 -z-10 opacity-90"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.93 0.04 60) 0%, oklch(0.88 0.06 50) 60%, oklch(0.82 0.08 40) 100%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
              <Trees className="h-3.5 w-3.5" /> Solid wood, built to last
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Wooden furniture,
              <br />
              <span className="text-primary">handcrafted</span> for life.
            </h1>
            <p className="mt-4 max-w-md text-sm text-foreground/75 md:text-base">
              Teak, sheesham, mango, oak and walnut — shaped by master carpenters,
              finished by hand, and delivered to your doorstep.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#shop"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-bold text-background shadow-pop transition hover:-translate-y-0.5"
              >
                Shop the collection <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#why"
                className="inline-flex items-center gap-2 rounded-xl border border-foreground/20 bg-background/60 px-5 py-3 text-sm font-bold backdrop-blur"
              >
                Why solid wood
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-foreground/10 shadow-pop">
            <img
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&auto=format&fit=crop"
              alt="Hand-finished wooden living room set"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Value strip */}
      <section id="why" className="border-b bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 md:grid-cols-4">
          {[
            { icon: Trees, t: "Sustainably sourced", d: "FSC-traceable timber only" },
            { icon: Hammer, t: "Handcrafted", d: "Joinery, not screws" },
            { icon: Leaf, t: "Natural finishes", d: "Beeswax & linseed oil" },
            { icon: Truck, t: "White-glove delivery", d: "Assembled in your home" },
          ].map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category chips */}
      <section id="shop" className="mx-auto max-w-7xl px-4 pt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">Shop by room</h2>
            <p className="text-sm text-muted-foreground">Pick a space, find pieces that fit.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip active={cat === "all"} onClick={() => setCat("all")} label="All" />
          {furnitureCategories.map((c) => (
            <Chip
              key={c.slug}
              active={cat === c.slug}
              onClick={() => setCat(c.slug)}
              label={c.name}
              tint={c.tint}
            />
          ))}
        </div>

        {/* Product grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 pb-16 md:grid-cols-3 lg:grid-cols-4">
          {items.map((it) => (
            <FurnitureCard key={it.id} item={it} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  tint,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tint?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-foreground/15 bg-background hover:bg-secondary"
      }`}
      style={!active && tint ? { backgroundColor: tint } : undefined}
    >
      {label}
    </button>
  );
}

function FurnitureCard({ item }: { item: FurnitureItem }) {
  const off = Math.round(((item.mrp - item.price) / item.mrp) * 100);
  return (
    <Link
      to="/furniture/$id"
      params={{ id: item.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary/60">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {off > 0 && (
          <div className="absolute left-3 top-3 rounded-md bg-discount px-1.5 py-0.5 text-[10px] font-bold text-white">
            {off}% OFF
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
          {item.wood}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="line-clamp-2 text-sm font-semibold leading-tight">{item.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">{item.dimensions}</div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <div className="text-base font-extrabold">₹{item.price.toLocaleString("en-IN")}</div>
            {off > 0 && (
              <div className="text-[11px] text-muted-foreground line-through">
                ₹{item.mrp.toLocaleString("en-IN")}
              </div>
            )}
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-foreground text-foreground transition group-hover:bg-foreground group-hover:text-background">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
