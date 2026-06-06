import { Link } from "@tanstack/react-router";
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
  const banners: Banner[] = ((data ?? []) as any);

  if (banners.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((b) => (
          <Link
            key={b.id}
            to={b.link_to}
            className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl p-5 shadow-card transition hover:opacity-95"
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
    </div>
  );
}
