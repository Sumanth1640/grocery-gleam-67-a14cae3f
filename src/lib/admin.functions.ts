import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

// ---------- Stats ----------
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [{ count: products }, { count: categories }, { count: orders }, { data: revRows }] =
      await Promise.all([
        supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("categories").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("orders").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("orders").select("total"),
      ]);
    const revenue = (revRows ?? []).reduce((s: number, r: any) => s + (r.total ?? 0), 0);
    return {
      products: products ?? 0,
      categories: categories ?? 0,
      orders: orders ?? 0,
      revenue,
    };
  });

// ---------- Products ----------
const productInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(120),
  category_slug: z.string().trim().min(1).max(60),
  image: z.string().trim().min(1).max(400),
  weight: z.string().trim().min(1).max(40),
  price: z.number().int().min(0).max(1_000_000),
  mrp: z.number().int().min(0).max(1_000_000),
  eta: z.string().trim().min(1).max(40).default("11 mins"),
  rating: z.number().min(0).max(5).default(4.5),
  in_stock: z.boolean().default(true),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload: any = { ...data };
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .upsert(payload, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Categories ----------
const categoryInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(80),
  image: z.string().trim().min(1).max(400),
  tint: z.string().trim().min(1).max(80).default("oklch(0.95 0.05 145)"),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => categoryInput.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .upsert(data as any, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Orders ----------
export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["placed", "packed", "out_for_delivery", "delivered", "cancelled"]),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Restaurant approval (partner portal) ----------
export const adminListRestaurants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ status: z.enum(["pending", "approved", "rejected", "all"]).default("pending") }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = supabaseAdmin.from("partner_restaurants").select("*").order("created_at", { ascending: false });
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSetRestaurantStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected", "pending"]) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: r, error } = await supabaseAdmin
      .from("partner_restaurants")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("owner_id, name")
      .single();
    if (error) throw new Error(error.message);
    if (r) {
      await supabaseAdmin.from("notifications").insert({
        user_id: r.owner_id,
        kind: "system",
        title: data.status === "approved" ? "Your restaurant is live!" : data.status === "rejected" ? "Restaurant rejected" : "Restaurant set to pending",
        body: data.status === "approved"
          ? `${r.name} is now live and visible to customers.`
          : data.status === "rejected"
            ? `${r.name} was not approved. Please update your details.`
            : `${r.name} is back in review.`,
        link: "/partner",
      });
    }
    return { ok: true };
  });
