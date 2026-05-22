import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 500 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const a = Buffer.from(expected);
        const b = Buffer.from(signature);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let payload: {
          event?: string;
          payload?: {
            payment?: { entity?: { id?: string; order_id?: string; status?: string } };
            order?: { entity?: { id?: string } };
            refund?: { entity?: { payment_id?: string } };
          };
        };
        try {
          payload = JSON.parse(body);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }

        const event = payload.event;
        const pay = payload.payload?.payment?.entity;

        try {
          if (event === "payment.captured" || event === "order.paid") {
            if (pay?.order_id) {
              await supabaseAdmin
                .from("orders")
                .update({
                  payment_status: "paid",
                  razorpay_payment_id: pay.id ?? null,
                } as never)
                .eq("razorpay_order_id", pay.order_id);
            }
          } else if (event === "payment.failed") {
            if (pay?.order_id) {
              await supabaseAdmin
                .from("orders")
                .update({ payment_status: "failed" } as never)
                .eq("razorpay_order_id", pay.order_id);
            }
          } else if (event === "refund.processed") {
            const refundedPaymentId = payload.payload?.refund?.entity?.payment_id;
            if (refundedPaymentId) {
              await supabaseAdmin
                .from("orders")
                .update({ payment_status: "refunded", status: "cancelled" } as never)
                .eq("razorpay_payment_id", refundedPaymentId);
            }
          }
        } catch (e) {
          console.error("Webhook handler error:", e);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
