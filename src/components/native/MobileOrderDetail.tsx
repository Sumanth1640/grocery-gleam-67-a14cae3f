import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php, phpUploads } from "@/lib/php-api";
import { getOrder, cancelOrder } from "@/lib/account.functions";
import { createRefundRequest, myRefundForOrder } from "@/lib/admin-extra.functions";
import { cartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { USE_PHP } from "@/lib/dual-api";
import { useAuth } from "@/lib/use-auth";
import type { Product } from "@/lib/catalog-types";
import { ChevronLeft, CheckCircle2, FileText, Loader2, MapPin, Package, Phone, Repeat, Truck, XCircle, AlertCircle, X } from "lucide-react";
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

  // ----- Refund -----
  const refundFetchRpc = useDualFn(myRefundForOrder, (d: any) => php.myRefundForOrder(d.order_id));
  const refundCreateRpc = useDualFn(createRefundRequest, (d: any) => php.createRefund(d));
  const refundQ = useQuery({
    queryKey: ["refund", id],
    queryFn: () => refundFetchRpc({ data: { order_id: id } }),
    enabled: !!order && order.status !== "placed",
  });
  const { user } = useAuth();
  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("Item missing");
  const [refundDetails, setRefundDetails] = useState("");
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const [uploadingProof, setUploadingProof] = useState(false);

  async function handleProofUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 5 - proofUrls.length;
    const picked = Array.from(files).slice(0, remaining);
    if (picked.length === 0) { toast.error("Max 5 images"); return; }
    setUploadingProof(true);
    try {
      const uploaded: string[] = [];
      for (const f of picked) {
        if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} > 5MB`); continue; }
        if (!user?.id) { toast.error("Please sign in again"); break; }
        if (USE_PHP) {
          const r = await phpUploads.refundProof(f, user.id);
          uploaded.push(r.url);
        } else {
          const path = `${user.id}/${Date.now()}-${f.name.replace(/[^A-Za-z0-9._-]/g, "_")}`;
          const { error } = await supabase.storage.from("refund-proofs").upload(path, f, { upsert: false });
          if (error) { toast.error(error.message); continue; }
          uploaded.push(`refund-proofs://${path}`);
        }
      }
      setProofUrls((prev) => [...prev, ...uploaded]);
    } finally {
      setUploadingProof(false);
    }
  }

  const refundM = useMutation({
    mutationFn: () => refundCreateRpc({ data: { order_id: id, reason: refundReason, details: refundDetails, amount: 0, proof_urls: proofUrls } }),
    onSuccess: () => {
      toast.success("Refund request submitted");
      setShowRefund(false); setRefundDetails(""); setProofUrls([]);
      qc.invalidateQueries({ queryKey: ["refund", id] });
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

      {/* Refund — shown inline above sticky actions */}
      {!isCancelled && order.status !== "placed" && (
        <div className="mt-3 px-5">
          {refundQ.data ? (
            <div
              className={`rounded-3xl p-4 ring-1 ${
                refundQ.data.status === "approved"
                  ? "bg-emerald-50 ring-emerald-200"
                  : refundQ.data.status === "rejected"
                  ? "bg-red-50 ring-red-200"
                  : "bg-amber-50 ring-amber-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <div className="text-sm font-extrabold capitalize text-zinc-900">
                  Refund {refundQ.data.status}
                </div>
              </div>
              <div className="mt-1 text-[11px] text-zinc-600">
                {refundQ.data.reason} · ₹{refundQ.data.amount} · Filed{" "}
                {new Date(refundQ.data.created_at).toLocaleDateString()}
              </div>
              {refundQ.data.admin_note && (
                <div className="mt-1 text-[11px] text-zinc-500">Note: {refundQ.data.admin_note}</div>
              )}
            </div>
          ) : showRefund ? (
            <form
              onSubmit={(e) => { e.preventDefault(); refundM.mutate(); }}
              className="space-y-2 rounded-3xl bg-white p-4 ring-1 ring-zinc-100 shadow-[0_4px_18px_rgba(15,23,42,0.06)]"
            >
              <div className="text-sm font-extrabold text-zinc-900">Request refund</div>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <option>Item missing</option>
                <option>Quality issue</option>
                <option>Wrong item delivered</option>
                <option>Damaged on arrival</option>
                <option>Order not delivered</option>
                <option>Other</option>
              </select>
              <textarea
                value={refundDetails}
                onChange={(e) => setRefundDetails(e.target.value)}
                rows={3}
                placeholder="Tell us what happened"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRefund(false)}
                  className="flex-1 rounded-xl bg-zinc-100 py-2 text-xs font-bold text-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundM.isPending}
                  className="flex-1 rounded-xl bg-amber-600 py-2 text-xs font-extrabold text-white disabled:opacity-60"
                >
                  {refundM.isPending ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          ) : (
            (order.status === "delivered" || order.status === "out_for_delivery") && (
              <button
                onClick={() => setShowRefund(true)}
                className="w-full rounded-2xl bg-amber-50 py-3 text-sm font-extrabold text-amber-700 ring-1 ring-amber-200"
              >
                Request refund
              </button>
            )
          )}
        </div>
      )}

      {/* Sticky actions — sits above the floating native bottom dock */}
      <div className="fixed inset-x-0 bottom-24 z-30 px-3">
        <div className="mx-auto flex max-w-md gap-2 rounded-3xl border border-zinc-100 bg-white/95 p-2 shadow-lg backdrop-blur">
          <button
            onClick={() => navigate({ to: "/orders/$id/invoice", params: { id } })}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-100 py-3 text-sm font-bold text-zinc-900"
          >
            <FileText className="h-4 w-4" /> Invoice
          </button>
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
