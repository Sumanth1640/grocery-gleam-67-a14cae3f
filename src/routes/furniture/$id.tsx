import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ChevronLeft, Trees, Hammer, Truck, ShieldCheck } from "lucide-react";
import { furnitureItems } from "@/lib/furniture-data";

export const Route = createFileRoute("/furniture/$id")({
  loader: ({ params }) => {
    const item = furnitureItems.find((i) => i.slug === params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.item.name} — Wooden Furniture` },
            { name: "description", content: loaderData.item.blurb },
            { property: "og:title", content: loaderData.item.name },
            { property: "og:description", content: loaderData.item.blurb },
            { property: "og:image", content: loaderData.item.image },
          ],
        }
      : { meta: [{ title: "Wooden Furniture" }] },
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      Piece not found.
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  component: FurnitureDetail,
});

function FurnitureDetail() {
  const { item } = Route.useLoaderData();
  const off = Math.round(((item.mrp - item.price) / item.mrp) * 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link
          to="/furniture"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to collection
        </Link>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border bg-secondary/40">
            <img src={item.image} alt={item.name} className="aspect-square w-full object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Trees className="h-3.5 w-3.5" /> {item.wood} wood
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              {item.name}
            </h1>
            <p className="mt-3 text-sm text-foreground/75 md:text-base">{item.blurb}</p>

            <div className="mt-5 flex items-end gap-3">
              <div className="text-3xl font-extrabold">
                ₹{item.price.toLocaleString("en-IN")}
              </div>
              {off > 0 && (
                <>
                  <div className="text-base text-muted-foreground line-through">
                    ₹{item.mrp.toLocaleString("en-IN")}
                  </div>
                  <div className="rounded-md bg-discount px-1.5 py-0.5 text-xs font-bold text-white">
                    {off}% OFF
                  </div>
                </>
              )}
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <Spec k="Dimensions" v={item.dimensions} />
              <Spec k="Wood" v={item.wood} />
              <Spec k="Finish" v="Beeswax & linseed oil" />
              <Spec k="Assembly" v="White-glove, included" />
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background shadow-pop transition hover:-translate-y-0.5">
                Request a quote
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl border-2 border-foreground px-6 py-3 text-sm font-bold">
                Book a showroom visit
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Hammer, t: "Handcrafted joinery" },
                { icon: Truck, t: "Free white-glove delivery" },
                { icon: ShieldCheck, t: "5-year structural warranty" },
                { icon: Trees, t: "FSC-traceable timber" },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="flex items-center gap-2 rounded-xl border bg-card p-3 text-xs font-semibold">
                  <Icon className="h-4 w-4 text-primary" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {k}
      </div>
      <div className="mt-0.5 text-sm font-semibold">{v}</div>
    </div>
  );
}
