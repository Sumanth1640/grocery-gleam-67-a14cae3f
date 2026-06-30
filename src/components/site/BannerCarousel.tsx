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

export function BannerCarousel() {
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
    (banner): banner is Banner => !!banner && typeof banner === "object" && "id" in banner,
  );

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const recompute = () => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.clientWidth <= 0) {
      setPageCount(1);
      setPage(0);
      return;
    }
    const pages = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    setPageCount(pages);
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    recompute();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.clientWidth <= 0) return;
      setPage(Math.round(el.scrollLeft / el.clientWidth));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recompute);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", recompute);
    };
  }, [banners.length]);

  // auto-advance
  useEffect(() => {
    if (pageCount <= 1) return;
    const t = setInterval(() => {
      const el = scrollerRef.current;
      if (!el || el.clientWidth <= 0) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % pageCount;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(t);
  }, [pageCount]);

  if (banners.length === 0) return null;

  const goTo = (p: number) => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth <= 0) return;
    el.scrollTo({ left: p * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((b) => (
          <Link
            key={b.id}
            to={b.link_to}
            className="relative flex w-[85%] shrink-0 snap-start items-center justify-between gap-3 overflow-hidden rounded-2xl p-5 shadow-card transition hover:opacity-95 sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)]"
            style={{ background: b.bg, color: b.fg, minHeight: 100 }}
          >
            {b.image && (
              <>
                <img
                  src={b.image}
                  alt={b.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              </>
            )}
            <div className="relative z-10 min-w-0" style={{ color: b.image ? "#fff" : b.fg }}>
              <div className="truncate font-display text-base font-extrabold md:text-lg">{b.title}</div>
              {b.subtitle && <div className="mt-0.5 truncate text-xs opacity-90">{b.subtitle}</div>}
            </div>
            <span className="relative z-10 shrink-0 rounded-full bg-background px-3 py-1.5 text-xs font-bold text-foreground shadow-pop">
              {b.cta_label || "Shop"} →
            </span>
          </Link>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, n) => (
            <button
              key={n}
              aria-label={`Go to page ${n + 1}`}
              onClick={() => goTo(n)}
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
