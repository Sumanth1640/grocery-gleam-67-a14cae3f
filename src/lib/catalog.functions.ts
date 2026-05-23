import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Category, Product } from "./catalog-types";

// ---------- Public reads (use admin client to bypass RLS for anon SSR) ----------
// RLS allows public read on these tables anyway; using admin client avoids
// auth-header requirements during SSR / loaders.

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
});

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
});

export const productsByCategory = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(60) }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("category_slug", data.slug)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Product[];
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as Product | null;
  });

export const searchProducts = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ q: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (!q) return [] as Product[];
    const { data: rows, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .ilike("name", `%${q}%`)
      .limit(60);
    if (error) throw new Error(error.message);
    return (rows ?? []) as Product[];
  });

// ---------- Admin writes ----------
const productInput = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(1).max(120),
  category_slug: z.string().trim().min(1).max(60),
  image: z.string().trim().min(1).max(400),
  weight: z.string().trim().min(1).max(40),
  price: z.number().int().min(0).max(1_000_000),
  mrp: z.number().int().min(0).max(1_000_000),
  in_stock: z.boolean().default(true),
});

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .upsert(data, { onConflict: "slug" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row as Product;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isAdmin = createServerFn({ method: "GET" }).handler(async () => {
  // Tolerant check: returns { isAdmin: false } when there's no session,
  // instead of throwing — safe to call from any component.
  const { getRequest } = await import("@tanstack/react-start/server");
  const req = getRequest();
  const authHeader = req?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return { isAdmin: false, isWarehouseManager: false, warehouseIds: [] as string[] };
  const token = authHeader.slice(7);
  if (!token) return { isAdmin: false, isWarehouseManager: false, warehouseIds: [] as string[] };

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: claims } = await supabase.auth.getClaims(token);
  const userId = claims?.claims?.sub;
  if (!userId) return { isAdmin: false, isWarehouseManager: false, warehouseIds: [] as string[] };

  const [{ data: adminRow }, { data: wmRows }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    supabaseAdmin.from("warehouse_managers").select("warehouse_id").eq("user_id", userId),
  ]);
  const warehouseIds = (wmRows ?? []).map((r: { warehouse_id: string | null }) => r.warehouse_id).filter(Boolean) as string[];
  return { isAdmin: !!adminRow, isWarehouseManager: warehouseIds.length > 0, warehouseIds };
});
