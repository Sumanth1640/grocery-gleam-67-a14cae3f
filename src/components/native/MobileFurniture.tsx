import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Search, Trees, Hammer, Truck, Leaf } from "lucide-react";
import {
  furnitureCategories,
  furnitureItems as fallbackItems,
  type FurnitureItem,
} from "@/lib/furniture-data";
import { php } from "@/lib/php-api";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const ACCENT = "oklch(0.62 0.14 55)"; // warm wood tone

export function MobileFurniture() {
  const navigate = useNavigate();
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["furniture", "all"],
    queryFn: () => php.furniture(),
    staleTime: 60_000,
  });

  const all: FurnitureItem[] =
    query.data && query.data.length > 0 ? (query.data as FurnitureItem[]) : fallbackItems;

  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter(
      (i) =>
        (cat === "all" || i.category === cat) &&
        (!t || i.name.toLowerCase().includes(t) || i.wood.toLowerCase().includes(t)),
    );
  }, [all, cat, q]);

  return (
    <div className="min-h-screen bg-white pb-28" style={FONT}>
      {/* Hero */}
      <header
        className="relative overflow-hidden rounded-b-[2rem] px-5 pt-10 pb-7 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.32 0.04 50) 0%, oklch(0.22 0.03 40) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur"
          >
            <Trees className="h-3 w-3" /> Solid wood
          </div>
          <div className="w-10" />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold leading-[1.05] tracking-tight">
          Handcrafted
          <br />
          <span style={{ color: ACCENT }}>wooden</span> furniture.
        </h1>
        <p className="mt-2 max-w-[18rem] text-[13px] text-white/70">
          Teak, sheesham, mango, oak — shaped by master carpenters, finished by hand.
        </p>

        {/* Search */}
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pieces or wood…"
            className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400"
          />
        </div>
      </header>

      {/* Promises */}
      <section className="-mt-3 px-5">
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-zinc-100 bg-white p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]">
          {[
            { i: Trees, t: "FSC" },
            { i: Hammer, t: "Joinery" },
            { i: Leaf, t: "Beeswax" },
            { i: Truck, t: "Delivered" },
          ].map(({ i: Icon, t }) => (
            <div key={t} className="flex flex-col items-center gap-1 px-1 py-1">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ background: "oklch(0.96 0.02 60)", color: ACCENT }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[10px] font-bold text-zinc-700">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category chips */}
      <section className="mt-6 px-5">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={cat === "all"} onClick={() => setCat("all")} label="All" />
          {furnitureCategories.map((c) => (
            <Chip
              key={c.slug}
              active={cat === c.slug}
              onClick={() => setCat(c.slug)}
              label={c.name}
            />
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mt-5 px-5">
        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-zinc-100 bg-white p-8 text-center">
            <div className="text-sm font-bold text-zinc-800">Nothing matches that.</div>
            <p className="mt-1 text-[12px] text-zinc-500">Try a different category or wood.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <Card key={it.id} item={it} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
        active
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function Card({ item }: { item: FurnitureItem }) {
  const off = Math.round(((item.mrp - item.price) / item.mrp) * 100);
  return (
    <Link
      to="/furniture/$id"
      params={{ id: item.slug }}
      className="group relative block overflow-hidden rounded-3xl bg-zinc-100"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute left-2.5 right-2.5 top-2.5 flex items-start justify-between gap-2">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-800 backdrop-blur">
            {item.wood}
          </span>
          {off > 0 && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[9px] font-extrabold text-white"
              style={{ background: "oklch(0.55 0.22 25)" }}
            >
              {off}%
            </span>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <h3 className="text-[13px] font-extrabold leading-tight line-clamp-2">
            {item.name}
          </h3>
          <div className="mt-1.5 flex items-end gap-1.5">
            <div className="text-base font-extrabold">
              ₹{item.price.toLocaleString("en-IN")}
            </div>
            {off > 0 && (
              <div className="pb-0.5 text-[10px] text-white/60 line-through">
                ₹{item.mrp.toLocaleString("en-IN")}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
