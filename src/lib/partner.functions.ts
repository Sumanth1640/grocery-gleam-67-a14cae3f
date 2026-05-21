import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugRe = /^[a-z0-9-]+$/;

const basicsInput = z.object({
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
  owner_name: z.string().trim().min(2).max(80),
  owner_email: z.string().trim().email().max(120),
  owner_phone: z.string().trim().min(7).max(20),
});

const documentsInput = z.object({
  fssai_number: z.string().trim().min(5).max(40),
  fssai_doc_url: z.string().trim().min(1).max(500),
  fssai_expiry: z.string().trim().min(8).max(20),
  pan_number: z.string().trim().min(5).max(20),
  pan_doc_url: z.string().trim().min(1).max(500),
  gst_number: z.string().trim().max(20).optional().nullable(),
  gst_doc_url: z.string().trim().max(500).optional().nullable(),
  bank_account_name: z.string().trim().min(2).max(80),
  bank_account_number: z.string().trim().min(5).max(30),
  bank_ifsc: z.string().trim().min(6).max(20),
  bank_proof_url: z.string().trim().min(1).max(500),
  shop_license_doc_url: z.string().trim().min(1).max(500),
});

const agreementInput = z.object({
  agreement_signature: z.string().trim().min(2).max(80),
  agreement_version: z.string().trim().min(1).max(20).default("v1.0"),
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

// Live slug uniqueness check
export const checkSlugAvailable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ slug: z.string().trim().min(2).max(60).regex(slugRe) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("partner_restaurants")
      .select("id, owner_id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { available: true };
    return { available: row.owner_id === userId };
  });

// Step 1 — basics (create or update)
export const saveBasics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => basicsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // ensure restaurant role
    await supabase.from("user_roles").insert({ user_id: userId, role: "restaurant" as never });

    const { data: existing } = await supabase
      .from("partner_restaurants")
      .select("id, onboarding_step")
      .eq("owner_id", userId)
      .maybeSingle();

    const payload = { ...data, offer: data.offer || null };

    if (existing) {
      const nextStep = Math.max(existing.onboarding_step ?? 1, 2);
      const { error } = await supabase
        .from("partner_restaurants")
        .update({ ...payload, onboarding_step: nextStep })
        .eq("id", existing.id)
        .eq("owner_id", userId);
      if (error) throw new Error(error.message);
      return { ok: true, id: existing.id };
    }
    const { data: row, error } = await supabase
      .from("partner_restaurants")
      .insert({ ...payload, owner_id: userId, status: "pending", onboarding_step: 2 })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// Step 2 — documents
export const saveDocuments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => documentsInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("partner_restaurants").select("id, onboarding_step").eq("owner_id", userId).maybeSingle();
    if (!existing) throw new Error("Complete basics first");
    const nextStep = Math.max(existing.onboarding_step ?? 2, 3);
    const { error } = await supabase
      .from("partner_restaurants")
      .update({
        ...data,
        gst_number: data.gst_number || null,
        gst_doc_url: data.gst_doc_url || null,
        onboarding_step: nextStep,
      })
      .eq("id", existing.id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Step 3 — menu (just advance step once at least 1 dish exists)
export const advanceAfterMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("partner_restaurants").select("id, onboarding_step").eq("owner_id", userId).maybeSingle();
    if (!existing) throw new Error("Create restaurant first");
    const { count } = await supabase
      .from("partner_dishes")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", existing.id);
    if (!count || count < 1) throw new Error("Add at least one dish to your menu first");
    const nextStep = Math.max(existing.onboarding_step ?? 3, 4);
    await supabase.from("partner_restaurants").update({ onboarding_step: nextStep }).eq("id", existing.id);
    return { ok: true };
  });

// Step 4 — agreement
export const acceptAgreement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => agreementInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase.from("partner_restaurants").select("id, onboarding_step").eq("owner_id", userId).maybeSingle();
    if (!existing) throw new Error("Create restaurant first");
    const nextStep = Math.max(existing.onboarding_step ?? 4, 5);
    const { error } = await supabase
      .from("partner_restaurants")
      .update({
        agreement_accepted_at: new Date().toISOString(),
        agreement_version: data.agreement_version,
        agreement_signature: data.agreement_signature,
        onboarding_step: nextStep,
      })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Step 5 — submit for review
export const submitForReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: r } = await supabase.from("partner_restaurants").select("*").eq("owner_id", userId).maybeSingle();
    if (!r) throw new Error("Create restaurant first");
    const missing: string[] = [];
    if (!r.name || !r.slug || !r.area || !r.owner_email || !r.owner_phone) missing.push("basic details");
    if (!r.fssai_number || !r.fssai_doc_url) missing.push("FSSAI license");
    if (!r.pan_number || !r.pan_doc_url) missing.push("PAN");
    if (!r.bank_account_number || !r.bank_ifsc || !r.bank_proof_url) missing.push("bank details");
    if (!r.shop_license_doc_url) missing.push("shop license");
    if (!r.agreement_accepted_at) missing.push("partner agreement");
    if (missing.length) throw new Error(`Please complete: ${missing.join(", ")}`);
    const { error } = await supabase
      .from("partner_restaurants")
      .update({ status: "pending", onboarding_step: 5, rejection_reason: null })
      .eq("id", r.id);
    if (error) throw new Error(error.message);
    await supabase.from("notifications").insert({
      user_id: userId,
      kind: "system",
      title: "Submitted for review",
      body: "We'll verify your documents within 24 hours and notify you.",
      link: "/partner",
    } as never);
    return { ok: true };
  });

// Get a signed URL for a doc the partner owns (in their {uid}/ folder)
export const getMyDocSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.path.startsWith(`${userId}/`)) throw new Error("Forbidden");
    const { data: signed, error } = await supabase.storage.from("partner-docs").createSignedUrl(data.path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
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

// ----- Orders -----
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
    const { error } = await supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
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
