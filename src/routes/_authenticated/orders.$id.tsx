import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php, phpUploads } from "@/lib/php-api";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getOrder, cancelOrder } from "@/lib/account.functions";
import { cartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { USE_PHP } from "@/lib/dual-api";
import { useAuth } from "@/lib/use-auth";
import { useIsAdmin } from "@/lib/use-is-admin";
import { ArrowLeft, CheckCircle2, Circle, Loader2, MapPin, Package, Repeat, Truck, Download, X, Star } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalog-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { upsertReview } from "@/lib/reviews.functions";
import { createRefundRequest, myRefundForOrder } from "@/lib/admin-extra.functions";
import { customerGetOrderRider } from "@/lib/rider.functions";
import { Bike, Phone as PhoneIcon } from "lucide-react";

type OrderItem = { product: Product; qty: number };

const STATUS_STEPS = [
  { id: "placed", label: "Order placed", icon: CheckCircle2 },
  { id: "packed", label: "Packed", icon: Package },
  { id: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

import { useIsNative } from "@/lib/use-native";
import { MobileOrderDetail } from "@/components/native/MobileOrderDetail";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — hallifresh" }] }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.endsWith("/invoice")) return <Outlet />;
  const isNative = useIsNative();
  if (isNative) return <MobileOrderDetail id={id} />;
  return <WebOrderDetailPage id={id} />;
}

function WebOrderDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const fetchOrder = useDualFn(getOrder, (d: any) => php.getOrder(d.id));
  const qc = useQueryClient();
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
    staleTime: 0,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Live tracking — refresh when admin updates this order's status.
  // Realtime respects RLS, so the socket must carry the user's access token.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let lastStatus: string | undefined;

    const start = async () => {
      if (USE_PHP) return; // No realtime in PHP mode — polling below handles it.
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);

      channel = supabase
        .channel(`order-${id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
          (payload) => {
            const updatedOrder = payload.new as typeof order | null;
            const next = updatedOrder?.status;
            if (next && lastStatus && next !== lastStatus) {
              toast.success(`Order ${next.replace(/_/g, " ")}`);
            }
            if (next) lastStatus = next;
            if (updatedOrder) qc.setQueryData(["order", id], updatedOrder);
            qc.refetchQueries({ queryKey: ["order", id], type: "active" });
          },
        )
        .subscribe();
    };

    start();

    // Safety net: poll frequently in case the realtime socket is dropped
    // (mobile networks, background tabs, proxies that close idle WS).
    const poll = setInterval(() => {
      qc.refetchQueries({ queryKey: ["order", id], type: "active" });
    }, 3000);

    return () => {
      clearInterval(poll);
      if (channel) supabase.removeChannel(channel);
    };
  }, [id, qc]);

  const items = ((order?.items as unknown as OrderItem[]) ?? []);
  const address = order?.address as unknown as {
    full_name: string; phone: string; line1: string; line2?: string | null; city: string; pincode: string; type: string;
  } | undefined;

  const currentStep = STATUS_STEPS.findIndex((s) => s.id === order?.status);
  const activeIndex = currentStep === -1 ? 0 : currentStep;

  const handleReorder = () => {
    items.forEach((it) => {
      for (let i = 0; i < it.qty; i++) cartStore.add(it.product);
    });
    toast.success("Items added to cart");
    navigate({ to: "/cart" });
  };

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

  const reviewRpc = useDualFn(upsertReview, (d: any) => php.addReview(d));
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const reviewM = useMutation({
    mutationFn: async () => {
      // Submit one review per distinct product in the order
      const seen = new Set<string>();
      for (const it of items) {
        if (seen.has(it.product.id)) continue;
        seen.add(it.product.id);
        await reviewRpc({ data: { target_type: "product", target_id: it.product.id, rating, body: reviewBody || null, title: null } });
      }
    },
    onSuccess: () => { toast.success("Thanks for your feedback!"); setShowReview(false); },
    onError: (e: Error) => toast.error(e.message),
  });

  // ----- Refund request -----
  const refundFetchRpc = useDualFn(myRefundForOrder, (d: any) => php.myRefundForOrder(d.order_id));
  const refundCreateRpc = useDualFn(createRefundRequest, (d: any) => php.createRefund(d));
  const refundQ = useQuery({
    queryKey: ["refund", id],
    queryFn: () => refundFetchRpc({ data: { order_id: id } }),
    enabled: !!order && order.status !== "placed",
  });
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
        if (USE_PHP) {
          if (!user?.id) { toast.error("Please sign in again"); break; }
          const r = await phpUploads.refundProof(f, user.id);
          uploaded.push(r.url);
        } else {
          if (!user?.id) { toast.error("Please sign in again"); break; }
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
  const canRequestRefund = !!order && (order.status === "delivered" || order.status === "cancelled" || order.status === "out_for_delivery") && !refundQ.data;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to orders
        </Link>

        {isLoading ? (
          <div className="grid h-40 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : !order ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-card">
            <h2 className="font-display text-lg font-bold">Order not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">This order doesn't exist or isn't yours.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold md:text-3xl">Order #{order.id.slice(0, 8)}</h1>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    order.status === "delivered" ? "bg-success/15 text-success" :
                    order.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                    "bg-primary/15 text-primary"
                  }`}>
                    {(order.status ?? "placed").replace(/_/g, " ")}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Placed {new Date(order.created_at).toLocaleString()}
                  {(order as any).scheduled_for && (
                    <> · Scheduled for {new Date((order as any).scheduled_for).toLocaleString()}</>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/orders/$id/invoice"
                  params={{ id: order.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold hover:bg-secondary"
                >
                  <Download className="h-3.5 w-3.5" /> Invoice
                </Link>
                {order.status === "placed" && (order.user_id === user?.id || isAdmin) && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelM.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/5 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                )}
                <button
                  onClick={handleReorder}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop hover:opacity-95"
                >
                  <Repeat className="h-3.5 w-3.5" /> Reorder
                </button>
              </div>
            </div>

            {order.status === "delivered" && (
              <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                {!showReview ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold">How was your order? Help others by leaving a quick review.</div>
                    <button onClick={() => setShowReview(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-pop">
                      <Star className="h-3.5 w-3.5" /> Rate items
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); reviewM.mutate(); }}
                    className="space-y-3"
                  >
                    <div className="text-sm font-bold">Rate your order</div>
                    <div className="inline-flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button type="button" key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} star`}>
                          <Star className={`h-6 w-6 ${i < rating ? "fill-current text-success" : "text-muted-foreground opacity-40"}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      rows={3}
                      maxLength={1000}
                      placeholder="Share your experience (optional)"
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={reviewM.isPending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">
                        {reviewM.isPending ? "Submitting…" : "Submit review"}
                      </button>
                      <button type="button" onClick={() => setShowReview(false)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Refund request */}
            {order.status !== "placed" && (
              <div className="mt-4">
                {refundQ.data ? (
                  <div className={`rounded-2xl border p-4 ${
                    refundQ.data.status === "approved" ? "border-success/30 bg-success/5" :
                    refundQ.data.status === "rejected" ? "border-destructive/30 bg-destructive/5" :
                    "border-amber-500/30 bg-amber-500/5"
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold capitalize">Refund {refundQ.data.status}</div>
                        <div className="text-xs text-muted-foreground">
                          {refundQ.data.reason} · ₹{refundQ.data.amount} · Filed {new Date(refundQ.data.created_at).toLocaleDateString()}
                        </div>
                        {refundQ.data.admin_note && (
                          <div className="mt-1 text-xs text-muted-foreground">Note: {refundQ.data.admin_note}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : canRequestRefund ? (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                    {!showRefund ? (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Something wrong with this order? Request a refund.</div>
                        <button onClick={() => setShowRefund(true)} className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-pop hover:opacity-95">
                          Request refund
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); refundM.mutate(); }} className="space-y-3">
                        <div className="text-sm font-bold">Refund request</div>
                        <label className="block text-xs font-semibold">
                          <span className="mb-1 block text-muted-foreground">Reason</span>
                          <select value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                            <option>Item missing</option>
                            <option>Wrong item delivered</option>
                            <option>Damaged / spoiled</option>
                            <option>Quality issue</option>
                            <option>Never delivered</option>
                            <option>Other</option>
                          </select>
                        </label>
                        <label className="block text-xs font-semibold">
                          <span className="mb-1 block text-muted-foreground">Details (optional)</span>
                          <textarea
                            value={refundDetails}
                            onChange={(e) => setRefundDetails(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="Share more so we can help faster"
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
                          />
                        </label>
                        <div>
                          <div className="mb-1 text-xs font-semibold text-muted-foreground">
                            Photo proof (optional, up to 5) — helps for damaged or missing items
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {proofUrls.map((u, i) => (
                              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                                <img src={u.startsWith("refund-proofs://") ? "" : u} alt="proof" className="h-full w-full object-cover" />
                                {u.startsWith("refund-proofs://") && (
                                  <div className="absolute inset-0 grid place-items-center text-[9px] text-muted-foreground">uploaded</div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setProofUrls((p) => p.filter((_, idx) => idx !== i))}
                                  className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-white"
                                  aria-label="Remove"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {proofUrls.length < 5 && (
                              <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border border-dashed text-[10px] text-muted-foreground hover:bg-secondary">
                                {uploadingProof ? <Loader2 className="h-4 w-4 animate-spin" /> : "+ Add"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  disabled={uploadingProof}
                                  onChange={(e) => { handleProofUpload(e.target.files); e.currentTarget.value = ""; }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground">Refund amount of ₹{order.total} will be reviewed by our team.</div>

                        <div className="flex gap-2">
                          <button type="submit" disabled={refundM.isPending} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-pop disabled:opacity-50">
                            {refundM.isPending ? "Submitting…" : "Submit request"}
                          </button>
                          <button type="button" onClick={() => setShowRefund(false)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Cancel</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : null}
              </div>
            )}


            {/* Status timeline */}
            <div className="mt-6 rounded-2xl border bg-card p-6 shadow-card">
              <div className="text-sm font-bold text-foreground">Track your Order</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Order Code: <span className="font-mono font-semibold text-foreground">{order.id.slice(0, 12)}</span>
              </div>

              <div className="relative mt-8 px-2 pb-2">
                {/* Background line */}
                <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-secondary" />
                {/* Animated progress line */}
                <div
                  className="absolute left-[12.5%] top-5 h-1 rounded-full bg-success transition-[width] duration-1000 ease-out"
                  style={{
                    width: `calc(${(activeIndex / (STATUS_STEPS.length - 1)) * 75}%)`,
                  }}
                />
                <ol className="relative grid grid-cols-4 gap-2">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= activeIndex;
                    const isCurrent = i === activeIndex && order.status !== "delivered";
                    return (
                      <li key={step.id} className="flex flex-col items-center text-center">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-full ring-4 ring-card transition-all duration-500 ${
                            done
                              ? "bg-success text-success-foreground"
                              : "bg-secondary text-muted-foreground"
                          } ${isCurrent ? "animate-pulse-ring" : ""}`}
                          style={{ transitionDelay: `${i * 200}ms` }}
                        >
                          {done ? (
                            <CheckCircle2
                              key={`done-${i}`}
                              className="h-5 w-5 animate-check-pop"
                              strokeWidth={2.5}
                            />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`mt-2 text-xs font-semibold transition-colors ${
                            done ? "text-success" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div key={order.status} className="mt-6 animate-fade-in">
                <div className="text-sm font-bold text-foreground">
                  {order.status === "delivered"
                    ? "Your order has been delivered"
                    : `Your order is ${(STATUS_STEPS[activeIndex]?.label ?? "being processed").toLowerCase()}`}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
              {/* Items */}
              <div className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </div>
                <ul className="mt-3 divide-y">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center gap-3 py-3">
                      {it.product.image && (
                        <img src={it.product.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 text-sm font-semibold">{it.product.name}</div>
                        <div className="text-xs text-muted-foreground">{it.product.weight} · Qty {it.qty}</div>
                      </div>
                      <div className="text-sm font-bold">₹{it.product.price * it.qty}</div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary + address */}
              <div className="space-y-5">
                <div className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Summary</div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <Row label="Subtotal" value={`₹${order.subtotal}`} />
                    <Row label="Delivery" value={order.delivery > 0 ? `₹${order.delivery}` : "Free"} />
                    <Row label="Payment" value={(order.payment ?? "").toUpperCase()} />
                    <div className="my-2 border-t" />
                    <Row label="Total" value={`₹${order.total}`} bold />
                  </dl>
                </div>

                {address && (
                  <div className="rounded-2xl border bg-card p-5 shadow-card">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Delivery to</div>
                    </div>
                    <div className="mt-3 text-sm font-bold">{address.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city} — {address.pincode}
                    </div>
                    <div className="text-xs text-muted-foreground">+91 {address.phone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel confirmation modal */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel order?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will cancel order #{order.id.slice(0, 8)}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>Keep order</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setShowCancelDialog(false);
                      cancelM.mutate();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-bold" : ""}`}>
      <dt className={bold ? "" : "text-muted-foreground"}>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
