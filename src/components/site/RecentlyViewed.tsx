import { useRecentlyViewed } from "@/lib/recently-viewed-store";
import { ProductGrid } from "./ProductGrid";
import { History } from "lucide-react";

export function RecentlyViewed({ excludeId, limit = 10 }: { excludeId?: string; limit?: number }) {
  const items = useRecentlyViewed().filter((p) => p.id !== excludeId).slice(0, limit);
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <History className="h-3.5 w-3.5" /> Recently viewed
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold md:text-3xl">Pick up where you left off</h2>
        </div>
      </div>
      <div className="mt-6">
        <ProductGrid products={items} />
      </div>
    </section>
  );
}
