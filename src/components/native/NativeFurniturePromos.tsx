import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Trees } from "lucide-react";
import { php } from "@/lib/php-api";

type Promo = {
  id: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  blurb?: string;
  image: string;
  cta_label: string;
  cta_link: string;
  bg_gradient?: string;
};

/**
 * Native horizontal furniture promo strip for MobileHome.
 * Pulls from the same admin-managed `furniture_promos` table used on web.
 */
export function NativeFurniturePromos() {
  const { data, isLoading } = useQuery({
    queryKey: ["furniture-promos"],
    queryFn: () => php.furniturePromos(),
    staleTime: 60_000,
  });

  const promos: Promo[] = Array.isArray(data) ? (data as Promo[]) : [];
  if (!isLoading && promos.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-extrabold text-zinc-900">
          Wooden furniture
        </h3>
        <Link to="/furniture" className="text-xs font-bold text-amber-700">
          View all
        </Link>
      </div>
      <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-44 w-72 shrink-0 animate-pulse rounded-[2rem] bg-zinc-100"
              />
            ))
          : promos.map((p) => {
              const isInternal = p.cta_link?.startsWith("/");
              const style = {
                background:
                  p.bg_gradient ||
                  "linear-gradient(135deg, oklch(0.93 0.04 60) 0%, oklch(0.82 0.08 40) 100%)",
              } as const;
              const Inner = (
                <div
                  className="relative h-44 w-72 shrink-0 overflow-hidden rounded-[2rem] border border-amber-100 shadow-sm"
                  style={style}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    className="absolute inset-y-0 right-0 h-full w-1/2 object-cover"
                  />
                  <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-white/85 via-white/60 to-transparent" />
                  <div className="relative flex h-full w-3/5 flex-col justify-between p-4">
                    {p.eyebrow && (
                      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-amber-300/60 bg-white/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-800 backdrop-blur">
                        <Trees className="h-3 w-3" /> {p.eyebrow}
                      </div>
                    )}
                    <div>
                      <h4 className="font-display text-base font-extrabold leading-tight text-zinc-900 line-clamp-2">
                        {p.title}
                      </h4>
                      {p.highlight && (
                        <div className="text-sm font-extrabold text-amber-700 line-clamp-1">
                          {p.highlight}
                        </div>
                      )}
                    </div>
                    <span className="inline-flex w-fit items-center gap-1 rounded-xl bg-zinc-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
                      {p.cta_label} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
              return isInternal ? (
                <Link key={p.id} to={p.cta_link as string} className="block">
                  {Inner}
                </Link>
              ) : (
                <a key={p.id} href={p.cta_link} className="block">
                  {Inner}
                </a>
              );
            })}
      </div>
    </section>
  );
}
