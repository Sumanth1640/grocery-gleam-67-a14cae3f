import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const addressSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^\d{10}$/),
  line1: z.string().trim().min(3).max(160),
  line2: z.string().trim().max(160).optional().nullable(),
  city: z.string().trim().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/),
  type: z.enum(["Home", "Work", "Other"]).default("Home"),
  is_default: z.boolean().default(false),
});

const itemSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    weight: z.string(),
    price: z.number().int().nonnegative(),
    mrp: z.number().int().nonnegative(),
    image: z.string(),
  }).passthrough(),
  qty: z.number().int().positive().max(99),
});

const orderPayloadSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  address: addressSchema,
  payment: z.enum(["upi", "card"]),
  subtotal: z.number().int().nonnegative(),
  delivery: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  restaurant_id: z.string().uuid().optional().nullable(),
  customer_lat: z.number().min(-90).max(90).optional().nullable(),
  customer_lng: z.number().min(-180).max(180).optional().nullable(),
  coupon_id: z.string().uuid().optional().nullable(),
  coupon_discount: z.number().int().nonnegative().optional().nullable(),
  scheduled_for: z.string().datetime().optional().nullable(),
});

// Create a Razorpay order. Returns order_id + public key for the browser checkout.
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ amount: z.number().int().positive().max(10_000_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    if (!keyId || !keySecret) throw new Error("Razorpay not configured");

    const receipt = `rcpt_${context.userId.slice(0, 8)}_${Date.now()}`;
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: data.amount * 100, // paise
        currency: "INR",
        receipt,
        notes: { user_id: context.userId },
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("Razorpay order error:", res.status, txt);
      throw new Error("Could not create payment order");
    }
    const body = (await res.json()) as { id: string; amount: number; currency: string };
    return { order_id: body.id, amount: body.amount, currency: body.currency, key_id: keyId };
  });

// Verify Razorpay signature, then create the order row with payment_status='paid'.
export const verifyAndPlaceOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
      order: orderPayloadSchema,
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new Error("Invalid payment signature");
    }

    const { supabase, userId } = context;
    const p = data.order;

    let warehouse_id: string | null = null;
    let outlet_id: string | null = null;
    if (p.restaurant_id) {
      const { data: out } = await supabaseAdmin.rpc("resolve_outlet_for_restaurant", {
        _restaurant_id: p.restaurant_id,
        _lat: p.customer_lat ?? undefined,
        _lng: p.customer_lng ?? undefined,
      });
      outlet_id = (out as unknown as string | null) ?? null;
    } else {
      const { data: wh } = await supabaseAdmin.rpc("resolve_warehouse_for_pincode", {
        _pincode: p.address.pincode,
      });
      warehouse_id = (wh as unknown as string | null) ?? null;
    }

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: p.items as unknown as never,
        address: p.address as unknown as never,
        payment: p.payment,
        subtotal: p.subtotal,
        delivery: p.delivery,
        total: p.total,
        restaurant_id: p.restaurant_id ?? null,
        warehouse_id,
        outlet_id,
        scheduled_for: p.scheduled_for ?? null,
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        payment_status: "paid",
      } as never)
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    if (p.coupon_id) {
      try {
        await supabase.from("coupon_redemptions").insert({
          coupon_id: p.coupon_id,
          user_id: userId,
          order_id: row.id,
          discount: p.coupon_discount ?? 0,
        });
        const { data: c } = await supabaseAdmin
          .from("coupons")
          .select("used_count")
          .eq("id", p.coupon_id)
          .maybeSingle();
        if (c) {
          await supabaseAdmin
            .from("coupons")
            .update({ used_count: (c.used_count ?? 0) + 1 })
            .eq("id", p.coupon_id);
        }
      } catch { /* non-fatal */ }
    }

    if (warehouse_id && !p.restaurant_id) {
      const stockItems = p.items
        .map((it) => ({ product_id: it.product.id, qty: it.qty }))
        .filter((it) => /^[0-9a-f-]{36}$/i.test(it.product_id));
      if (stockItems.length) {
        await supabaseAdmin.rpc("decrement_warehouse_stock", {
          _warehouse_id: warehouse_id,
          _items: stockItems as unknown as never,
        });
      }
    }
    return row;
  });
