import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugRe = /^[a-z0-9-]+$/;

const restaurantInput = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(60).regex(slugRe),
  cuisines: z.array(z.string().trim().min(1).max(40)).min(1).max(10),
  image: z.string().trim().max(500).default(""),
  cover: z.string().trim().max(500).default(""),
  eta_mins: z.number().int().min(10).max(120).default(30),
  cost_for_two: z.number().int().min(50).max(10000).default(400),
  veg: z.boolean().default(false),
  price_tier: z.number().int().min(1).max(3).default(2),
  offer: z.string().trim().max(120).optional().nullable(),
  area: z.string().trim().min(2).max(80),
  distance_km: z.number().min(0).max(50).default(1.5),
  opens_at: z.string().trim().max(8).optional().nullable(),
  closes_at: z.string().trim().max(8).optional().nullable(),
  is_open: z.boolean().default(true),
});

export const becomePartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: userId, role: "restaurant" as never })
      .select()
      .single();
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const myRestaurant = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("partner_restaurants")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const createMyRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => restaurantInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Ensure 'restaurant' role assigned
    await supabase.from("user_roles").insert({ user_id: userId, role: "restaurant" as never });
    const { data: row, error } = await supabase
      .from("partner_restaurants")
      .insert({ ...data, owner_id: userId, status: "pending" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateMyRestaurant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), patch: restaurantInput.partial() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("partner_restaurants")
      .update(data.patch)
      .eq("id", data.id)
      .eq("owner_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// ----- Dishes -----
const dishInput = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).default(""),
  image: z.string().trim().max(500).default(""),
  price: z.number().int().min(0).max(100000),
  mrp: z.number().int().min(0).max(100000).optional().nullable(),
  veg: z.boolean().default(true),
  spicy: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  section: z.string().trim().min(1).max(40).default("Mains"),
  in_stock: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(10000).default(0),
});

const variantInput = z.object({ name: z.string().trim().min(1).max(40), price: z.number().int().min(0).max(100000), sort_order: z.number().int().default(0) });
const addonInput = variantInput;

export const listMyDishes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: r } = await supabase.from("partner_restaurants").select("id").eq("owner_id", userId).maybeSingle();
    if (!r) return [];
    const { data, error } = await supabase
      .from("partner_dishes")
      .select("*, partner_dish_variants(*), partner_dish_addons(*)")
      .eq("restaurant_id", r.id)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createDish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    dish: dishInput,
    variants: z.array(variantInput).max(10).default([]),
    addons: z.array(addonInput).max(20).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: r } = await supabase.from("partner_restaurants").select("id").eq("owner_id", userId).maybeSingle();
    if (!r) throw new Error("Create your restaurant first");
    const { data: dish, error } = await supabase
      .from("partner_dishes")
      .insert({ ...data.dish, restaurant_id: r.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data.variants.length) {
      await supabase.from("partner_dish_variants").insert(data.variants.map((v) => ({ ...v, dish_id: dish.id })));
    }
    if (data.addons.length) {
      await supabase.from("partner_dish_addons").insert(data.addons.map((v) => ({ ...v, dish_id: dish.id })));
    }
    return dish;
  });

export const updateDish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    dish: dishInput.partial(),
    variants: z.array(variantInput).max(10).optional(),
    addons: z.array(addonInput).max(20).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("partner_dishes").update(data.dish).eq("id", data.id);
    if (error) throw new Error(error.message);
    if (data.variants) {
      await supabase.from("partner_dish_variants").delete().eq("dish_id", data.id);
      if (data.variants.length) await supabase.from("partner_dish_variants").insert(data.variants.map((v) => ({ ...v, dish_id: data.id })));
    }
    if (data.addons) {
      await supabase.from("partner_dish_addons").delete().eq("dish_id", data.id);
      if (data.addons.length) await supabase.from("partner_dish_addons").insert(data.addons.map((v) => ({ ...v, dish_id: data.id })));
    }
    return { ok: true };
  });

export const deleteDish = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("partner_dishes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleDishStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), in_stock: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("partner_dishes").update({ in_stock: data.in_stock }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Orders (Phase 3) -----
export const listMyRestaurantOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: r } = await supabase.from("partner_restaurants").select("id").eq("owner_id", userId).maybeSingle();
    if (!r) return [];
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", r.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ORDER_STATUSES = ["placed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(ORDER_STATUSES) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // RLS guards via restaurant ownership
    const { error } = await supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    // Notify the customer
    const { data: order } = await supabase.from("orders").select("user_id, id").eq("id", data.id).single();
    if (order) {
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        kind: "order",
        title: `Order ${data.status.replace("_", " ")}`,
        body: `Your order status was updated to "${data.status.replace("_", " ")}".`,
        link: `/orders/${order.id}`,
      } as never);
    }
    void userId;
    return { ok: true };
  });
