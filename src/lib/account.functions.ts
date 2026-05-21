import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

const orderSchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  address: addressSchema,
  payment: z.enum(["upi", "card", "cod"]),
  subtotal: z.number().int().nonnegative(),
  delivery: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  restaurant_id: z.string().uuid().optional().nullable(),
  customer_lat: z.number().min(-90).max(90).optional().nullable(),
  customer_lng: z.number().min(-180).max(180).optional().nullable(),
});

// ---------- Profile ----------
export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      full_name: z.string().trim().min(1).max(80),
      phone: z.string().regex(/^\d{10}$/).optional().or(z.literal("")),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.full_name, phone: data.phone || null })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Addresses ----------
export const listAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => addressSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    }
    const { data: row, error } = await supabase
      .from("addresses")
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    addressSchema.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id, ...rest } = data;
    if (rest.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    }
    const { data: row, error } = await supabase
      .from("addresses")
      .update(rest)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("addresses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

// ---------- Orders ----------
export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => orderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Resolve fulfillment location
    let warehouse_id: string | null = null;
    let outlet_id: string | null = null;

    if (data.restaurant_id) {
      const { data: out } = await supabaseAdmin.rpc("resolve_outlet_for_restaurant", {
        _restaurant_id: data.restaurant_id,
        _lat: data.customer_lat ?? undefined,
        _lng: data.customer_lng ?? undefined,
      });
      outlet_id = (out as unknown as string | null) ?? null;
    } else {
      // Grocery: route to a warehouse by pincode (optional — null means no warehouse coverage yet)
      const { data: wh } = await supabaseAdmin.rpc("resolve_warehouse_for_pincode", { _pincode: data.address.pincode });
      warehouse_id = (wh as unknown as string | null) ?? null;
    }

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: data.items as unknown as never,
        address: data.address as unknown as never,
        payment: data.payment,
        subtotal: data.subtotal,
        delivery: data.delivery,
        total: data.total,
        restaurant_id: data.restaurant_id ?? null,
        warehouse_id,
        outlet_id,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    // Decrement stock for grocery orders when warehouse known.
    if (warehouse_id && !data.restaurant_id) {
      const stockItems = data.items
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

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
