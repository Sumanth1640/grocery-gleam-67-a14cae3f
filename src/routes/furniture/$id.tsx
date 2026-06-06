import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft, Trees, Hammer, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { furnitureItems as fallbackItems, type FurnitureItem } from "@/lib/furniture-data";
import { useQuery } from "@tanstack/react-query";
import { php } from "@/lib/php-api";

export const Route = createFileRoute("/furniture/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Wooden Furniture` },
      { name: "description", content: "Handcrafted solid wood piece from our collection." },
    ],
  }),
  component: FurnitureDetail,
});

function FurnitureDetail() {
  const { id } = Route.useParams();

  const q = useQuery({
    queryKey: ["furniture-item", id],
    queryFn: () => php.furnitureItem(id),
    staleTime: 60_000,
  });

  const fallback = fallbackItems.find((i) => i.slug === id);
  const item: FurnitureItem | null = (q.data as FurnitureItem | null) ?? fallback ?? null;

  if (q.isLoading && !item) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
          Piece not found.
        </div>
        <Footer />
      </div>
    );
  }

  const off = Math.round(((item.mrp - item.price) / item.mrp) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <Link
          to="/furniture"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to collection
        </Link>

        {/* Editorial promo hero */}
        <section className="mt-5 overflow-hidden rounded-3xl border bg-card shadow-card">
          <div className="grid gap-0 md:grid-cols-5">
            <div className="relative md:col-span-3">
              <img
                src={item.image}
                alt={item.name}
                className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] md:aspect-auto md:h-full"
              />
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
                  <Trees className="h-3.5 w-3.5 text-primary" /> {item.wood} wood
                </span>
                {off > 0 && (
                  <span className="rounded-md bg-discount px-2 py-1 text-[11px] font-extrabold text-white shadow-pop">
                    {off}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 p-6 md:col-span-2 md:p-8">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Featured piece
                </div>
                <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-tight md:text-4xl">
                  {item.name}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75 md:text-base">
                  {item.blurb}
                </p>

                <div className="mt-5 flex items-end gap-3">
                  <div className="font-display text-3xl font-extrabold md:text-4xl">
                    ₹{item.price.toLocaleString("en-IN")}
                  </div>
                  {off > 0 && (
                    <div className="pb-1 text-sm text-muted-foreground line-through">
                      ₹{item.mrp.toLocaleString("en-IN")}
                    </div>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-2 border-t pt-5 text-sm">
                <Spec k="Dimensions" v={item.dimensions} />
                <Spec k="Wood" v={item.wood} />
                <Spec k="Finish" v="Beeswax & linseed oil" />
                <Spec k="Assembly" v="White-glove, included" />
              </dl>
            </div>
          </div>
        </section>

        {/* Promo strip */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Hammer, t: "Handcrafted joinery" },
            { icon: Truck, t: "Free white-glove delivery" },
            { icon: ShieldCheck, t: "5-year structural warranty" },
            { icon: Trees, t: "FSC-traceable timber" },
          ].map(({ icon: Icon, t }) => (
            <div
              key={t}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-semibold shadow-card"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              {t}
            </div>
          ))}
        </section>
      </div>
      <Footer />
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="mt-0.5 text-sm font-semibold">{v}</div>
    </div>
  );
}
