import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Banner = {
  title: string;
  sub: string;
  cta: string;
  to: string;
  slug: string;
  bg: string;
  fg: string;
};

const banners: Banner[] = [
  {
    title: "Up to 40% off fresh produce",
    sub: "Hand-picked daily from local farms",
    cta: "Shop fruits",
    to: "/c/$slug",
    slug: "fruits",
    bg: "linear-gradient(135deg, oklch(0.92 0.13 80), oklch(0.88 0.16 50))",
    fg: "oklch(0.25 0.05 40)",
  },
  {
    title: "Midnight cravings? We've got you.",
    sub: "Snacks & beverages in 11 minutes",
    cta: "Browse snacks",
    to: "/c/$slug",
    slug: "snacks",
    bg: "linear-gradient(135deg, oklch(0.35 0.08 280), oklch(0.45 0.15 320))",
    fg: "oklch(0.98 0 0)",
  },
  {
    title: "Free delivery over ₹199",
    sub: "Stock up on weekly essentials",
    cta: "Shop dairy",
    to: "/c/$slug",
    slug: "dairy",
    bg: "linear-gradient(135deg, oklch(0.92 0.1 145), oklch(0.86 0.14 165))",
    fg: "oklch(0.2 0.05 150)",
  },
];

export function BannerCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl shadow-card">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
        >
          {banners.map((b) => (
            <div
              key={b.title}
              className="flex min-w-full items-center justify-between gap-4 p-6 md:p-10"
              style={{ background: b.bg, color: b.fg }}
            >
              <div className="max-w-md">
                <div className="font-display text-xl font-extrabold leading-tight md:text-3xl">
                  {b.title}
                </div>
                <div className="mt-1.5 text-xs opacity-80 md:text-sm">{b.sub}</div>
                <Link
                  to={b.to}
                  params={{ slug: b.slug }}
                  className="mt-4 inline-block rounded-xl bg-background px-4 py-2 text-xs font-bold text-foreground shadow-pop transition hover:opacity-90"
                >
                  {b.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
}
