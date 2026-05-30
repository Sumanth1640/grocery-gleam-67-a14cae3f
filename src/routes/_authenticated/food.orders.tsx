import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import { listOrders } from "@/lib/account.functions";
import { RESTAURANTS } from "@/lib/food-data";
import { foodCartStore } from "@/lib/food-cart-store";
import { toast } from "sonner";
import { Loader2, Utensils, RotateCcw, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/food/orders")({
  head: () => ({ meta: [{ title: "Food orders — hallifresh" }] }),
  component: FoodOrdersPage,
});

type StoredItem = {
  product: { id: string; name: string; image?: string; weight?: string; price: number };
  qty: number;
};
type StoredOrder = {
  id: string;
  created_at: string;
  status: string;
  payment: string;
  subtotal: number;
  delivery: number;
  total: number;
  items: StoredItem[];
  address: { full_name?: string; line1?: string; city?: string; pincode?: string };
};

// Food orders use lineId (contains "|") as product.id; grocery uses UUIDs.
const isFoodItem = (it: StoredItem) => typeof it.product.id === "string" && it.product.id.includes("|");
const isFoodOrder = (o: StoredOrder) => o.items.some(isFoodItem);

function reorder(order: StoredOrder, navigate: ReturnType<typeof useNavigate>) {
  // group items by restaurant (taken from product.weight which we stored as restaurantName)
  const byRestaurant = new Map<string, StoredItem[]>();
  for (const it of order.items.filter(isFoodItem)) {
    const key = it.product.weight ?? "";
    if (!byRestaurant.has(key)) byRestaurant.set(key, []);
    byRestaurant.get(key)!.push(it);
  }
  if (byRestaurant.size === 0) {
    toast.error("No food items to reorder");
    return;
  }
  // Pick the largest restaurant group (cart is single-restaurant)
  const [restaurantName, items] = [...byRestaurant.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  const restaurant = RESTAURANTS.find((r) => r.name === restaurantName);
  if (!restaurant) {
    toast.error(`${restaurantName || "Restaurant"} is no longer available`);
    return;
  }

  let added = 0;
  let missing = 0;
  for (const it of items) {
    const [dishId, variantId, ...addonIds] = it.product.id.split("|");
    const dish = restaurant.menu.find((d) => d.id === dishId);
    if (!dish) { missing += it.qty; continue; }
    const variant = variantId !== "_" ? dish.variants?.find((v) => v.id === variantId) : undefined;
    const addons = (dish.addons ?? []).filter((a) => addonIds.includes(a.id));
    for (let i = 0; i < it.qty; i++) {
      foodCartStore.add(restaurant, dish, variant, addons);
      added++;
    }
  }

  if (added === 0) {
    toast.error("None of these dishes are available anymore");
    return;
  }
  toast.success(
    `${added} item${added > 1 ? "s" : ""} added from ${restaurant.name}` +
      (missing > 0 ? ` · ${missing} unavailable` : ""),
  );
  navigate({ to: "/food/cart" });
}

function FoodOrdersPage() {
  const fetchOrders = useDualFn(listOrders, () => php.myOrders());
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "food"],
    queryFn: () => fetchOrders(),
  });

  const orders = ((data ?? []) as unknown as StoredOrder[]).filter(isFoodOrder);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold md:text-3xl">Food orders</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Your past food orders. Tap reorder to add the same items back to your cart.</p>

        {isLoading ? (
          <div className="grid h-32 place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-card">
            <Utensils className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-3 font-display text-lg font-bold">No food orders yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">When you order from a restaurant, it will appear here.</p>
            <Link to="/food" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop">
              Browse restaurants
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {orders.map((o) => {
              const foodItems = o.items.filter(isFoodItem);
              const restaurantName = foodItems[0]?.product.weight ?? "Restaurant";
              const totalQty = foodItems.reduce((s, i) => s + i.qty, 0);
              return (
                <li key={o.id} className="rounded-2xl border bg-card p-4 shadow-card md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                          {o.status}
                        </span>
                        <span className="text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span>
                        <span className="text-xs text-muted-foreground">
                          · {new Date(o.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 font-display text-lg font-bold">{restaurantName}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {totalQty} item{totalQty !== 1 ? "s" : ""} · {o.payment.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg font-extrabold">₹{o.total}</div>
                      <button
                        onClick={() => reorder(o, navigate)}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-pop transition hover:brightness-110"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reorder
                      </button>
                    </div>
                  </div>

                  <ul className="mt-3 divide-y rounded-xl border bg-background/50">
                    {foodItems.map((it, i) => (
                      <li key={i} className="flex items-center gap-3 p-2">
                        {it.product.image ? (
                          <img src={it.product.image} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                        ) : (
                          <div className="h-10 w-10 shrink-0 rounded-md bg-secondary" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{it.product.name}</div>
                          <div className="text-[11px] text-muted-foreground">Qty {it.qty} · ₹{it.product.price}</div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {o.address?.line1 && (
                    <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {o.address.full_name} · {o.address.line1}, {o.address.city} {o.address.pincode}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Delivered in ~30 min
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
}
