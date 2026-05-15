import { useState } from "react";
import { Plus, Minus, X } from "lucide-react";
import type { Dish, Restaurant } from "@/lib/food-data";
import { foodCartStore } from "@/lib/food-cart-store";
import { toast } from "sonner";

export function DishCustomizeDialog({
  open,
  onClose,
  restaurant,
  dish,
}: {
  open: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  dish: Dish;
}) {
  const [variantId, setVariantId] = useState(dish.variants?.[0]?.id);
  const [addonIds, setAddonIds] = useState<string[]>([]);

  if (!open) return null;
  const variant = dish.variants?.find((v) => v.id === variantId);
  const addons = (dish.addons ?? []).filter((a) => addonIds.includes(a.id));
  const total = (variant?.price ?? dish.price) + addons.reduce((s, a) => s + a.price, 0);

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const add = () => {
    foodCartStore.add(restaurant, dish, variant, addons);
    toast.success(`${dish.name} added to cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-card shadow-pop sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/80 backdrop-blur" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <img src={dish.image} alt={dish.name} className="h-44 w-full rounded-t-3xl object-cover sm:rounded-t-2xl" />
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <h2 className="font-display text-xl font-bold">{dish.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{dish.desc}</p>

          {dish.variants && dish.variants.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Choose size</div>
              <div className="mt-2 space-y-2">
                {dish.variants.map((v) => {
                  const active = variantId === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setVariantId(v.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm transition ${active ? "border-primary bg-primary/5" : "hover:bg-secondary"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`grid h-4 w-4 place-items-center rounded-full border-2 ${active ? "border-primary" : "border-border"}`}>
                          {active && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-semibold">{v.name}</span>
                      </div>
                      <span className="font-semibold">₹{v.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {dish.addons && dish.addons.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add-ons (optional)</div>
              <div className="mt-2 space-y-2">
                {dish.addons.map((a) => {
                  const active = addonIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm transition ${active ? "border-primary bg-primary/5" : "hover:bg-secondary"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`grid h-4 w-4 place-items-center rounded border-2 ${active ? "border-primary bg-primary" : "border-border"}`}>
                          {active && <div className="h-1.5 w-1.5 rounded-sm bg-primary-foreground" />}
                        </div>
                        <span className="font-semibold">{a.name}</span>
                      </div>
                      <span className="font-semibold">+ ₹{a.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t bg-card p-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</div>
            <div className="font-display text-xl font-extrabold">₹{total}</div>
          </div>
          <button onClick={add} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-pop hover:opacity-95">
            <Plus className="h-4 w-4" /> Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

export function VegBadge({ veg }: { veg: boolean }) {
  return (
    <span
      className={`grid h-3.5 w-3.5 place-items-center rounded-sm border ${veg ? "border-success" : "border-discount"}`}
      aria-label={veg ? "Veg" : "Non-veg"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${veg ? "bg-success" : "bg-discount"}`} />
    </span>
  );
}

export function QtyStepper({ qty, onInc, onDec }: { qty: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-primary px-2 py-1.5 text-primary-foreground">
      <button onClick={onDec} aria-label="Decrease" className="grid h-6 w-6 place-items-center rounded-md hover:bg-primary-foreground/10">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-[20px] text-center text-sm font-bold">{qty}</span>
      <button onClick={onInc} aria-label="Increase" className="grid h-6 w-6 place-items-center rounded-md hover:bg-primary-foreground/10">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
