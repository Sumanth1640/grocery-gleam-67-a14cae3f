import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductGrid } from "@/components/site/ProductGrid";
import { ProductGridSkeleton } from "@/components/site/ProductGridSkeleton";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import { RecentlyViewed } from "@/components/site/RecentlyViewed";
import { dualApi } from "@/lib/dual-api";
import { MobileHome } from "@/components/native/MobileHome";
import { useIsNative } from "@/lib/use-native";
import { USE_PHP } from "@/lib/dual-api";
import { php } from "@/lib/php-api";
import heroImg from "@/assets/hero-grocery.jpg";
import { Clock, Leaf, ShieldCheck, Truck, Utensils, ArrowRight, Star, Trees, Hammer } from "lucide-react";
import { furnitureCategories, furnitureItems as fallbackFurniture, type FurnitureItem } from "@/lib/furniture-data";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "hallifresh — Groceries delivered in 11 minutes" },
      { name: "description", content: "Order fruits, vegetables, dairy, snacks & more. Fresh groceries delivered to your door in minutes." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: () => dualApi.listCategories() });
  const prodsQ = useQuery({ queryKey: ["products"], queryFn: () => dualApi.listProducts() });
  const restosQ = useQuery({ queryKey: ["home-restaurants"], queryFn: () => dualApi.restaurants() });
  const dishesQ = useQuery({ queryKey: ["home-dishes"], queryFn: () => dualApi.allDishes() });


  const categories = catsQ.data ?? [];
  const products = prodsQ.data ?? [];
  const trending = products.slice(0, 10);
  const dairyAndBakery = [
    ...products.filter((p) => p.category_slug === "dairy"),
    ...products.filter((p) => p.category_slug === "bakery"),
  ].slice(0, 10);
  const popularRestos = (restosQ.data ?? []).slice(0, 4);
  const popularDishes = (dishesQ.data ?? []).slice(0, 5);

  const isNative = useIsNative();
  if (isNative) return <MobileHome />;

  return (
    <>
      <div className="min-h-screen bg-background">
      <Header />

      {/* HERO (managed via /admin/hero-slides) */}
      <HeroSection />


      <BannerCarousel />

      {/* FOOD DELIVERY — equal weight (50%) */}
      <section className="mx-auto max-w-7xl px-4 pt-8">
        <Link
          to="/food"
          className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-3xl border bg-discount/10 p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft md:p-8"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-discount px-3 py-1 text-xs font-bold text-white shadow-pop">
              <Utensils className="h-3.5 w-3.5" /> Food delivery
            </div>
            <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight md:text-4xl">
              Hungry? Order from your favourite restaurants.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Pizzas, biryanis, burgers, salads — delivered in 30 minutes.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-bold text-background">
              Browse restaurants <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </div>
          <img
            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=70"
            alt=""
            className="hidden aspect-square w-44 rounded-2xl object-cover shadow-pop md:block"
            loading="lazy"
          />
        </Link>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Shop by category" subtitle="Everything you need, neatly stacked" />
        {catsQ.isLoading ? (
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-4 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (

              <div key={i} className="rounded-2xl border bg-card p-3">
                <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:gap-4 lg:grid-cols-8">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/c/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center rounded-2xl border bg-card p-3 text-center shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div
                  className="grid aspect-square w-full max-w-[80px] place-items-center overflow-hidden rounded-xl"
                  style={{ backgroundColor: c.tint }}
                >
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="mt-2 text-xs font-semibold leading-tight">{c.name}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* OFFER STRIP */}
      <OfferStrip />


      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <SectionHeader title="Trending in your area" subtitle="What everyone's adding to cart" />
        <div className="mt-6">
          {prodsQ.isLoading ? <ProductGridSkeleton /> : <ProductGrid products={trending} />}
        </div>
      </section>

      {/* POPULAR RESTAURANTS (food) */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Popular restaurants near you" subtitle="Top-rated kitchens, delivered hot" />
        <div className="mt-6">
          {restosQ.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-3">
                  <div className="aspect-[16/10] w-full animate-pulse rounded-xl bg-muted" />
                  <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popularRestos.map((r: any) => (
                <Link
                  key={r.id}
                  to="/food/r/$slug"
                  params={{ slug: r.slug }}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    {r.offer && (
                      <div className="absolute left-3 top-3 rounded-md bg-discount px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-pop">
                        {r.offer}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-bold leading-tight">{r.name}</h3>
                      <div className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-[11px] font-bold text-success-foreground">
                        <Star className="h-3 w-3 fill-current" /> {r.rating}
                      </div>
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {(r.cuisines ?? []).join(" · ")}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.eta_mins} min</span>
                      <span>₹{r.cost_for_two} for two</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DAIRY/BAKERY (grocery) */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Dairy, bread & eggs" subtitle="Stock up on the fridge basics" />
        <div className="mt-6">
          {prodsQ.isLoading ? <ProductGridSkeleton /> : <ProductGrid products={dairyAndBakery} />}
        </div>
      </section>

      {/* POPULAR DISHES (food) */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <SectionHeader title="Crave-worthy dishes" subtitle="Loved by foodies in your area" />
        <div className="mt-6">
          {dishesQ.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-3">
                  <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
                  <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {popularDishes.map((d: any) => (
                <Link
                  key={d.id}
                  to="/food/r/$slug"
                  params={{ slug: d.restaurant?.slug ?? "" }}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
                >
                  <div className="aspect-square overflow-hidden">
                    <img src={d.image} alt={d.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-bold">{d.name}</h3>
                    <div className="line-clamp-1 text-[11px] text-muted-foreground">{d.restaurant?.name}</div>
                    <div className="mt-1 text-sm font-bold text-primary">₹{d.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <RecentlyViewed />

      <Footer />
      </div>
    </>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
      <span className="text-primary">{icon}</span>
      {text}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function OfferStrip() {
  const { data } = useQuery({
    queryKey: ["offer-tiles"],
    queryFn: async () => {
      if (USE_PHP) return await php.offerTiles();
      return [
        { id: "1", title: "Paan Corner",  subtitle: "Beverages, snacks & more", cta_label: "Shop", link_to: "/c/snacks",     tint: "oklch(0.92 0.12 30)" },
        { id: "2", title: "Dairy & Eggs", subtitle: "Daily essentials",          cta_label: "Shop", link_to: "/c/dairy",      tint: "oklch(0.93 0.10 95)" },
        { id: "3", title: "Fresh Veggies",subtitle: "Hand-picked daily",         cta_label: "Shop", link_to: "/c/vegetables", tint: "oklch(0.93 0.10 145)" },
      ];
    },
    staleTime: 60_000,
  });
  const tiles = (data ?? []) as Array<{ id: string; title: string; subtitle: string; cta_label: string; link_to: string; tint: string }>;
  if (tiles.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <OfferTile key={t.id} title={t.title} sub={t.subtitle} tint={t.tint} ctaLabel={t.cta_label || "Shop"} linkTo={t.link_to || "/"} />
        ))}
      </div>
    </section>
  );
}

function OfferTile({ title, sub, tint, ctaLabel = "Shop", linkTo = "/" }: { title: string; sub: string; tint: string; ctaLabel?: string; linkTo?: string }) {
  return (
    <Link
      to={linkTo}
      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border-0 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
      style={{ backgroundColor: tint }}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-foreground/5 transition-transform duration-500 group-hover:scale-110" />
      
      <div className="relative z-10 flex flex-col gap-1">
        <div className="font-display text-xl font-extrabold leading-tight tracking-tight md:text-2xl">{title}</div>
        <div className="text-sm font-medium text-foreground/60">{sub}</div>
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-background/80 px-4 py-2 text-xs font-bold backdrop-blur-sm transition-all group-hover:bg-background group-hover:shadow-md">
          {ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
      
      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
        <ArrowRight className="h-5 w-5 -rotate-45 text-foreground/40" />
      </div>
    </Link>
  );
}


type HeroSlide = {
  id: string;
  badge_text: string;
  title_line1: string;
  title_highlight: string;
  title_line3: string;
  description: string;
  primary_cta_label: string;
  primary_cta_link: string;
  secondary_cta_label: string;
  secondary_cta_link: string;
  image: string;
  deal_label: string;
  deal_text: string;
};

const FALLBACK_SLIDE: HeroSlide = {
  id: "fallback",
  badge_text: "Delivery in 11 minutes",
  title_line1: "Groceries.",
  title_highlight: "At your door,",
  title_line3: "before the kettle whistles.",
  description: "From farm-fresh produce to late-night snacks — order anything, anytime. Hand-picked quality, lightning fast.",
  primary_cta_label: "Shop now",
  primary_cta_link: "/c/fruits",
  secondary_cta_label: "Browse categories",
  secondary_cta_link: "#categories",
  image: "",
  deal_label: "Today's deal",
  deal_text: "Up to 40% off fresh produce",
};

function HeroSection() {
  const { data } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      if (USE_PHP) return php.heroSlides();
      const { listHeroSlides } = await import("@/lib/admin-extra.functions");
      return listHeroSlides();
    },
    staleTime: 60_000,
  });
  const slides: HeroSlide[] = (data && data.length ? (data as any) : [FALLBACK_SLIDE]);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const s = slides[Math.min(i, slides.length - 1)];
  const img = s.image || heroImg;

  return (
    <section className="bg-aisle">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16">
        <div>
          {s.badge_text && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground shadow-pop">
              <Clock className="h-3.5 w-3.5" /> {s.badge_text}
            </div>
          )}
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] text-balance md:text-6xl">
            {s.title_line1}
            {s.title_highlight && (<><br /><span className="text-primary">{s.title_highlight}</span></>)}
            {s.title_line3 && (<><br />{s.title_line3}</>)}
          </h1>
          {s.description && (
            <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">{s.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {s.primary_cta_label && (
              <a
                href={s.primary_cta_link || "/"}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop transition hover:opacity-95"
              >
                {s.primary_cta_label}
              </a>
            )}
            {s.secondary_cta_label && (
              <a
                href={s.secondary_cta_link || "#categories"}
                className="rounded-xl border bg-background px-5 py-3 text-sm font-bold transition hover:bg-secondary"
              >
                {s.secondary_cta_label}
              </a>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs">
            <Stat icon={<Truck className="h-4 w-4" />} text="Free delivery over ₹199" />
            <Stat icon={<Leaf className="h-4 w-4" />} text="Farm-fresh quality" />
            <Stat icon={<ShieldCheck className="h-4 w-4" />} text="Easy returns" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand-gradient blur-2xl opacity-60" />
          <img
            src={img}
            alt={s.title_line1}
            width={1600}
            height={1200}
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-pop"
          />
          {s.deal_text && (
            <div className="absolute -bottom-4 left-4 rounded-2xl border bg-card p-3 shadow-pop md:-left-6">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.deal_label}</div>
              <div className="text-sm font-bold">{s.deal_text}</div>
            </div>
          )}
          {slides.length > 1 && (
            <div className="absolute right-4 top-4 flex gap-1.5 rounded-full bg-background/80 p-1.5 backdrop-blur">
              {slides.map((_, n) => (
                <button
                  key={n}
                  aria-label={`Hero slide ${n + 1}`}
                  onClick={() => setI(n)}
                  className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-primary" : "w-1.5 bg-foreground/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

