import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { listOrders } from "@/lib/account.functions";
import { ChevronLeft, Loader2, Package } from "lucide-react";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

const STATUS_STEPS = ["placed", "packed", "out_for_delivery", "delivered"] as const;
const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  packed: "Packed",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_COLOR: Record<string, string> = {
  placed: "#f59e0b",
  packed: "#3b82f6",
  out_for_delivery: "#8b5cf6",
  delivered: "oklch(0.55 0.16 145)",
  cancelled: "#ef4444",
};

export function MobileOrders() {
  const navigate = useNavigate();
  const fetchOrders = useDualFn(listOrders, () => php.myOrders());
  const { data, isLoading } = useQuery({ queryKey: ["orders"], queryFn: () => fetchOrders() });


  return (
    <div className="min-h-screen bg-white pb-32" style={FONT}>
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pt-10 pb-4 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/account" })}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-zinc-900 leading-none">My orders</h1>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">{data?.length ?? 0} orders</p>
        </div>
      </header>

      <div className="px-5">
        {isLoading ? (
          <div className="grid h-64 place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
              <Package className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="mt-4 text-base font-extrabold text-zinc-900">No orders yet</p>
            <p className="mt-1 text-xs text-zinc-500">Your past orders will show up here.</p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-2xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: GREEN }}
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {data.map((o: any) => {
              const items = (o.items ?? []) as { product: { name: string; image?: string }; qty: number }[];
              const idx = STATUS_STEPS.indexOf(o.status);
              const pct = idx >= 0 ? (idx / (STATUS_STEPS.length - 1)) * 100 : 0;
              const color = STATUS_COLOR[o.status] ?? "#71717a";
              return (
                <li key={o.id}>
                  <Link
                    to="/orders/$id"
                    params={{ id: o.id }}
                    className="block rounded-3xl bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
                            style={{ background: color }}
                          >
                            {STATUS_LABELS[o.status] ?? o.status}
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-400">#{o.id.slice(0, 8)}</span>
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          {new Date(o.created_at).toLocaleString()}
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {items.length} item{items.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-zinc-900">₹{o.total}</div>
                      </div>
                    </div>

                    {o.status !== "cancelled" && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full transition-[width] duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {items.slice(0, 5).map((it, i) =>
                        it.product.image ? (
                          <img
                            key={i}
                            src={it.product.image}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-xl object-cover"
                          />
                        ) : null,
                      )}
                      {items.length > 5 && (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-zinc-100 text-[11px] font-extrabold text-zinc-500">
                          +{items.length - 5}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
