import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/lib/account.functions";
import { ArrowLeft, Loader2 } from "lucide-react";
import { buildInvoiceHtml } from "@/lib/invoice";
import type { Product } from "@/lib/catalog-types";

export const Route = createFileRoute("/_authenticated/orders/$id/invoice")({
  head: () => ({ meta: [{ title: "Invoice — hallifresh" }] }),
  component: InvoicePage,
});

type OrderItem = { product: Product; qty: number };

function InvoicePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fetchOrder = useDualFn(getOrder, (d: any) => php.getOrder(d.id));
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/orders/$id", params: { id } });
    }
  };

  const orderLike = order
    ? {
        ...order,
        items: order.items as unknown as OrderItem[],
        address: order.address as any,
      }
    : null;

  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Sticky app toolbar with Back + Download */}
      <div className="sticky top-0 z-20 flex items-center gap-2 bg-primary px-3 py-3 text-primary-foreground shadow-md">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-bold hover:bg-white/25"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex-1 truncate text-sm font-bold">
          Invoice {order ? `#${order.id.slice(0, 8).toUpperCase()}` : ""}
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-4">
        {isLoading ? (
          <div className="grid h-40 place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !orderLike ? (
          <div className="rounded-2xl border bg-card p-10 text-center shadow-card">
            <h2 className="font-display text-lg font-bold">Order not found</h2>
          </div>
        ) : (
          <div
            className="invoice-sheet rounded-2xl bg-white p-6 text-[color:#111] shadow-card"
            dangerouslySetInnerHTML={{ __html: buildInvoiceHtml(orderLike as any) }}
          />
        )}
      </div>
    </div>
  );
}
