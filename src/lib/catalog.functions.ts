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

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });
