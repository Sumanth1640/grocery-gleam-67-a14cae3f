import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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

/**
 * Native (mobile shell) banner carousel — same data source as the web
 * BannerCarousel. Auto-advances every 5s. Hides when no banners exist.
 */
export function NativeBannerCarousel({ className = "" }: { className?: string }) {
  const { data } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      if (USE_PHP) return (await php.banners()) as Banner[];
      const { listBanners } = await import("@/lib/admin-extra.functions");
      return listBanners();
    },
    staleTime: 60_000,
  });

  const banners: Banner[] = (Array.isArray(data) ? data : []).filter(
    (b): b is Banner => !!b && typeof b === "object" && "id" in b,
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => setPage(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className={className}>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b) => (
          <Link
            key={b.id}
            to={b.link_to}
            className="relative flex w-full shrink-0 snap-start items-center justify-between overflow-hidden rounded-[2rem] p-6 shadow-pop"
            style={{ background: b.bg || "#16a34a", color: b.fg || "#ffffff", minHeight: 140 }}
          >
            {b.image && (
              <>
                <img
                  src={b.image}
                  alt={b.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
              </>
            )}
            <div
              className="relative z-10 max-w-[70%]"
              style={{ color: b.image ? "#fff" : b.fg }}
            >
              <div className="font-display text-lg font-extrabold leading-tight">{b.title}</div>
              {b.subtitle && (
                <div className="mt-1 text-xs font-medium opacity-90">{b.subtitle}</div>
              )}
              <span className="mt-3 inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-foreground shadow">
                {b.cta_label || "Shop"} →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {banners.map((_, n) => (
            <span
              key={n}
              aria-hidden
              className={`h-1.5 rounded-full transition-all ${
                n === page ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
