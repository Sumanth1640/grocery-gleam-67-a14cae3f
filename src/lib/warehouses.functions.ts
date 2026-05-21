import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

const warehouseInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  code: z.string().trim().min(1).max(40).regex(/^[a-zA-Z0-9_-]+$/),
  address: z.string().trim().max(300).default(""),
  city: z.string().trim().max(80).default(""),
  pincode: z.string().trim().max(10).default(""),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const listWarehouses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("warehouses").select("*").order("sort_order").order("created_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveWarehouse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => warehouseInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("warehouses").upsert(data as any, { onConflict: "code" }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteWarehouse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("warehouses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- pincodes ----
export const listWarehousePincodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ warehouse_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("warehouse_pincodes").select("*").eq("warehouse_id", data.warehouse_id)
      .order("priority", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const setWarehousePincodes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    warehouse_id: z.string().uuid(),
    pincodes: z.array(z.string().regex(/^\d{4,8}$/)).max(500),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    await supabaseAdmin.from("warehouse_pincodes").delete().eq("warehouse_id", data.warehouse_id);
    if (data.pincodes.length) {
      const rows = data.pincodes.map((p) => ({ warehouse_id: data.warehouse_id, pincode: p }));
      const { error } = await supabaseAdmin.from("warehouse_pincodes").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---- stock ----
export const listWarehouseStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ warehouse_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [{ data: stock, error: e1 }, { data: products, error: e2 }] = await Promise.all([
      supabaseAdmin.from("product_stock").select("*").eq("warehouse_id", data.warehouse_id),
      supabaseAdmin.from("products").select("id, name, slug, image").order("name"),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    const map = new Map((stock ?? []).map((s: any) => [s.product_id, s]));
    return (products ?? []).map((p: any) => ({
      product: p,
      qty: map.get(p.id)?.qty ?? 0,
      low_stock_threshold: map.get(p.id)?.low_stock_threshold ?? 5,
      has_row: map.has(p.id),
    }));
  });

export const setProductStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    warehouse_id: z.string().uuid(),
    product_id: z.string().uuid(),
    qty: z.number().int().min(0).max(1_000_000),
    low_stock_threshold: z.number().int().min(0).max(100_000).default(5),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("product_stock")
      .upsert(data as any, { onConflict: "warehouse_id,product_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
