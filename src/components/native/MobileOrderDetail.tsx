import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { getOrder, cancelOrder } from "@/lib/account.functions";
import { cartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { USE_PHP } from "@/lib/dual-api";
import type { Product } from "@/lib/catalog-types";
import { ChevronLeft, CheckCircle2, Download, Loader2, MapPin, Package, Phone, Repeat, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

type OrderItem = { product: Product; qty: number };
const STATUS_STEPS = [
  { id: "placed", label: "Placed", icon: CheckCircle2 },
  { id: "packed", label: "Packed", icon: Package },
  { id: "out_for_delivery", label: "On the way", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

export function MobileOrderDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const fetchOrder = useDualFn(getOrder, (d: any) => php.getOrder(d.id));
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
    refetchInterval: 4000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (USE_PHP) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
      channel = supabase
        .channel(`order-native-${id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => {
          qc.refetchQueries({ queryKey: ["order", id], type: "active" });
        })
        .subscribe();
    })();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [id, qc]);

  const items = ((order?.items as unknown as OrderItem[]) ?? []);
  const address = order?.address as unknown as {
    full_name: string; phone: string; line1: string; line2?: string | null; city: string; pincode: string; type: string;
  } | undefined;

  const cancelRpc = useDualFn(cancelOrder, async (d: { id: string }) => php.cancelOrder(d.id));
  const cancelM = useMutation({
    mutationFn: () => cancelRpc({ data: { id } }),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["order", id] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleReorder = () => {
    items.forEach((it) => { for (let i = 0; i < it.qty; i++) cartStore.add(it.product); });
    toast.success("Items added to cart");
    navigate({ to: "/cart" });
  };

  if (isLoading || !order) {
    return (
      <div className="grid min-h-screen place-items-center bg-white" style={FONT}>
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const stepIdx = STATUS_STEPS.findIndex((s) => s.id === order.status);
  const activeIndex = stepIdx === -1 ? 0 : stepIdx;
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";
  const canCancel = order.status === "placed" || order.status === "packed";

  return (
    <div className="min-h-screen bg-white pb-36" style={FONT}>
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pt-10 pb-4 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/orders" })}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-zinc-900 leading-none">Order #{order.id.slice(0, 8)}</h1>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
      </header>

      <div className="px-5 space-y-3">
        {/* Status card */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100">
          {isCancelled ? (
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-zinc-900">Order cancelled</div>
                <div className="text-[11px] text-zinc-500">This order has been cancelled.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="grid h-10 w-10 place-items-center rounded-2xl text-white"
                  style={{ background: GREEN }}
                >
                  {(() => { const Icon = STATUS_STEPS[activeIndex].icon; return <Icon className="h-5 w-5" />; })()}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-zinc-900">{STATUS_STEPS[activeIndex].label}</div>
                  <div className="text-[11px] text-zinc-500">
                    {isDelivered ? "Delivered successfully" : "Live tracking"}
                  </div>
                </div>
              </div>
              <ol className="mt-5 flex items-center">
                {STATUS_STEPS.map((s, i) => {
                  const done = i <= activeIndex;
                  return (
                    <li key={s.id} className="flex flex-1 items-center last:flex-initial">
                      <div
                        className={`grid h-7 w-7 place-items-center rounded-full text-[10px] font-extrabold ${
                          done ? "text-white" : "bg-zinc-100 text-zinc-400"
                        }`}
                        style={done ? { background: GREEN } : undefined}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className="h-1 flex-1 rounded-full"
                          style={{ background: i < activeIndex ? GREEN : "#e4e4e7" }}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
              <div className="mt-2 grid grid-cols-4 text-center text-[10px] font-bold text-zinc-500">
                {STATUS_STEPS.map((s, i) => (
                  <span key={s.id} className={i <= activeIndex ? "text-zinc-900" : ""}>{s.label}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Address */}
        {address && (
          <div className="rounded-3xl bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="text-sm font-extrabold text-zinc-900">Delivery address</div>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              <div className="font-bold text-zinc-900">{address.full_name}</div>
              <div>
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city} — {address.pincode}
              </div>
              <a href={`tel:${address.phone}`} className="mt-1 inline-flex items-center gap-1 font-semibold" style={{ color: GREEN }}>
                <Phone className="h-3 w-3" /> +91 {address.phone}
              </a>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="rounded-3xl bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
              <Package className="h-4 w-4" />
            </div>
            <div className="text-sm font-extrabold text-zinc-900">
              {items.reduce((s, i) => s + i.qty, 0)} items
            </div>
          </div>
          <ul className="mt-3 divide-y divide-zinc-100">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex items-center gap-3 py-2.5">
                {product.image && (
                  <img src={product.image} alt="" className="h-11 w-11 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs font-bold text-zinc-900">{product.name}</div>
                  <div className="text-[10px] text-zinc-500">Qty {qty}</div>
                </div>
                <div className="text-xs font-extrabold text-zinc-900">₹{product.price * qty}</div>
              </li>
            ))}
          </ul>
          <div className="mt-2 space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
            <Row label="Subtotal" value={`₹${order.subtotal}`} />
            <Row label="Delivery" value={order.delivery ? `₹${order.delivery}` : "FREE"} />
            <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2 text-base">
              <span className="font-bold text-zinc-700">Total</span>
              <span className="font-extrabold text-zinc-900">₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky actions — sits above the floating native bottom dock */}
      <div className="fixed inset-x-0 bottom-24 z-30 px-3">
        <div className="mx-auto flex max-w-md gap-2 rounded-3xl border border-zinc-100 bg-white/95 p-2 shadow-lg backdrop-blur">
          <Link
            to="/orders/$id/invoice"
            params={{ id: order.id }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-100 py-3 text-sm font-bold text-zinc-900"
          >
            <Download className="h-4 w-4" /> Invoice
          </Link>
          {canCancel && (
            <button
              onClick={() => {
                if (confirm("Cancel this order?")) cancelM.mutate();
              }}
              disabled={cancelM.isPending}
              className="flex-1 rounded-2xl bg-zinc-100 py-3 text-sm font-bold text-zinc-900 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleReorder}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white"
            style={{ background: GREEN }}
          >
            <Repeat className="h-4 w-4" /> Reorder
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
