import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { USE_PHP } from "@/lib/dual-api";
import { php } from "@/lib/php-api";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta_label: string;
  link_to: string;
  bg: string;
  fg: string;
  image: string;
};

export function BannerCarousel() {
  const { data } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      if (USE_PHP) return [] as Banner[];
      const { listBanners } = await import("@/lib/admin-extra.functions");
      return listBanners();
    },
    staleTime: 60_000,
  });
  const banners: Banner[] = ((data ?? []) as any);

  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {banners.map((b) => (
            <div
              key={b.id}
              className="relative flex min-h-[180px] min-w-full items-center justify-between gap-4 p-6 md:min-h-[260px] md:p-10"
              style={{ background: b.bg, color: b.fg }}
            >
              {b.image && (
                <>
                  <img
                    src={b.image}
                    alt={b.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                </>
              )}
              <div className="relative z-10 max-w-md" style={{ color: b.image ? "#fff" : b.fg }}>
                <div className="font-display text-xl font-extrabold leading-tight drop-shadow md:text-3xl">{b.title}</div>
                <div className="mt-1.5 text-xs opacity-90 md:text-sm">{b.subtitle}</div>
                <Link
                  to={b.link_to}
                  className="mt-4 inline-block rounded-xl bg-background px-4 py-2 text-xs font-bold text-foreground shadow-pop transition hover:opacity-90"
                >
                  {b.cta_label} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, n) => (
              <button
                key={n}
                aria-label={`Go to slide ${n + 1}`}
                onClick={() => setI(n)}
                className={`h-1.5 rounded-full transition-all ${
                  n === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
