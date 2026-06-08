import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Share2,
  Trees,
  Hammer,
  Truck,
  ShieldCheck,
  Leaf,
  Loader2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import {
  furnitureItems as fallbackItems,
  type FurnitureItem,
} from "@/lib/furniture-data";
import { php } from "@/lib/php-api";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const ACCENT = "oklch(0.62 0.14 55)";

export function MobileFurnitureDetail({ id }: { id: string }) {
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["furniture-item", id],
    queryFn: () => php.furnitureItem(id),
    staleTime: 60_000,
  });

  const fallback = fallbackItems.find((i) => i.slug === id);
  const item: FurnitureItem | null = (q.data as FurnitureItem | null) ?? fallback ?? null;

  if (q.isLoading && !item) {
    return (
      <div className="grid min-h-screen place-items-center bg-white" style={FONT}>
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white pt-20 text-center" style={FONT}>
        <div className="text-sm font-bold text-zinc-800">Piece not found.</div>
        <Link
          to="/furniture"
          className="mt-4 inline-block rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-bold text-white"
        >
          Back to collection
        </Link>
      </div>
    );
  }

  const off = Math.round(((item.mrp - item.price) / item.mrp) * 100);

  const share = async () => {
    const url = `${window.location.origin}/furniture/${item.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: item.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* dismissed */
    }
  };

  const enquire = () => {
    toast.success("Our team will reach out within 24 hours");
  };

  return (
    <div className="min-h-screen bg-white pb-32" style={FONT}>
      {/* Hero image with floating header */}
      <div className="relative">
        <div className="aspect-[4/5] w-full overflow-hidden bg-zinc-100">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/30 to-transparent" />
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-10">
          <button
            onClick={() => navigate({ to: "/furniture" })}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/95 backdrop-blur"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5 text-zinc-800" />
          </button>
          <button
            onClick={share}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/95 backdrop-blur"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4 text-zinc-800" />
          </button>
        </header>

        <div className="absolute left-5 right-5 bottom-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-800 backdrop-blur"
          >
            <Trees className="h-3 w-3" style={{ color: ACCENT }} /> {item.wood}
          </span>
          {off > 0 && (
            <span
              className="rounded-md px-2 py-1 text-[10px] font-extrabold text-white"
              style={{ background: "oklch(0.55 0.22 25)" }}
            >
              {off}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Title card pulled up */}
      <section className="-mt-6 px-5">
        <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)]">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            Featured piece
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold leading-tight tracking-tight text-zinc-900">
            {item.name}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{item.blurb}</p>

          <div className="mt-4 flex items-end gap-3">
            <div className="text-3xl font-extrabold text-zinc-900">
              ₹{item.price.toLocaleString("en-IN")}
            </div>
            {off > 0 && (
              <div className="pb-1 text-sm text-zinc-400 line-through">
                ₹{item.mrp.toLocaleString("en-IN")}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Spec grid */}
      <section className="mt-4 px-5">
        <div className="grid grid-cols-2 gap-2">
          <Spec k="Dimensions" v={item.dimensions} />
          <Spec k="Wood" v={item.wood} />
          <Spec k="Finish" v="Beeswax & linseed oil" />
          <Spec k="Assembly" v="White-glove, included" />
        </div>
      </section>

      {/* Promises */}
      <section className="mt-5 px-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
          What you get
        </h2>
        <div className="mt-2 grid gap-2">
          {[
            { i: Hammer, t: "Handcrafted joinery", d: "Mortise & tenon, no screws" },
            { i: Truck, t: "Free white-glove delivery", d: "Assembled in your home" },
            { i: ShieldCheck, t: "5-year structural warranty", d: "Backed against splits & warps" },
            { i: Leaf, t: "FSC-traceable timber", d: "From responsibly managed forests" },
          ].map(({ i: Icon, t, d }) => (
            <div
              key={t}
              className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3"
            >
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: "oklch(0.96 0.02 60)", color: ACCENT }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-zinc-900">{t}</div>
                <div className="text-[11px] text-zinc-500">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom dock */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 px-4 pb-6 pt-3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 35%, white 100%)",
        }}
      >
        <div
          className="flex items-center gap-2 rounded-[1.5rem] p-2 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)]"
          style={{ background: "oklch(0.18 0.02 40)" }}
        >
          <a
            href="tel:+911800123456"
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white"
            aria-label="Call"
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            onClick={enquire}
            className="flex-1 rounded-2xl py-3.5 text-sm font-extrabold text-zinc-900"
            style={{ background: ACCENT }}
          >
            Enquire to order
          </button>
        </div>
      </div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{k}</div>
      <div className="mt-0.5 text-[13px] font-bold text-zinc-900">{v}</div>
    </div>
  );
}
