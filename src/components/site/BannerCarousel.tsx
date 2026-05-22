import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listBanners } from "@/lib/admin-extra.functions";

type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta_label: string;
  link_to: string;
  bg: string;
  fg: string;
};

const fallback: Banner[] = [
  {
    id: "1",
    title: "Up to 40% off fresh produce",
    subtitle: "Hand-picked daily from local farms",
    cta_label: "Shop fruits",
    link_to: "/c/fruits",
    bg: "linear-gradient(135deg, oklch(0.92 0.13 80), oklch(0.88 0.16 50))",
    fg: "oklch(0.25 0.05 40)",
  },
];

export function BannerCarousel() {
  const fetchBanners = useServerFn(listBanners);
  const { data } = useQuery({
    queryKey: ["banners"],
    queryFn: () => fetchBanners(),
    staleTime: 60_000,
  });
  const banners: Banner[] = (data && data.length > 0 ? (data as any) : fallback);

  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

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
              className="flex min-w-full items-center justify-between gap-4 p-6 md:p-10"
              style={{ background: b.bg, color: b.fg }}
            >
              <div className="max-w-md">
                <div className="font-display text-xl font-extrabold leading-tight md:text-3xl">{b.title}</div>
                <div className="mt-1.5 text-xs opacity-80 md:text-sm">{b.subtitle}</div>
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
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, n) => (
              <button
                key={n}
                aria-label={`Go to slide ${n + 1}`}
                onClick={() => setI(n)}
                className={`h-1.5 rounded-full transition-all ${
                  n === i ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
