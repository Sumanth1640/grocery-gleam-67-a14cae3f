import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { useRestaurantFavs, restaurantFavsStore } from "@/lib/restaurant-favs-store";
import { Heart, Star, Clock, MapPin, ArrowRight, X } from "lucide-react";

export const Route = createFileRoute("/food/favourites")({
  head: () => ({
    meta: [
      { title: "Your favourite restaurants — hallifresh" },
      { name: "description", content: "Quickly reorder from the restaurants you love." },
    ],
  }),
  component: FavouritesPage,
});

function FavouritesPage() {
  const favs = useRestaurantFavs();
  const list = Object.values(favs);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-discount/10 text-discount">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold md:text-3xl">Favourite restaurants</h1>
            <p className="text-xs text-muted-foreground">{list.length} saved</p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-card p-12 text-center shadow-card">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold">No favourites yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any restaurant to save it for later.</p>
            <Link to="/food" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
              Explore restaurants <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <div key={r.id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-pop">
                <button
                  onClick={() => restaurantFavsStore.remove(r.id)}
                  aria-label="Remove from favourites"
                  className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-card backdrop-blur hover:text-discount"
                >
                  <X className="h-4 w-4" />
                </button>
                <Link to="/food/r/$slug" params={{ slug: r.slug }} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-base font-bold">{r.name}</h3>
                      <div className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-[11px] font-bold text-success-foreground">
                        <Star className="h-3 w-3 fill-current" /> {r.rating}
                      </div>
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{r.cuisines.join(" · ")}</div>
                    <div className="mt-3 flex items-center gap-3 border-t pt-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.etaMins} min</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.area}</span>
                      <span className="ml-auto font-semibold">₹{r.costForTwo} for two</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
