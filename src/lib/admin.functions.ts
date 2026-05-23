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

/** Returns { isAdmin, warehouseIds } — throws if user is neither admin nor warehouse manager. */
async function ensureAdminOrManager(userId: string): Promise<{ isAdmin: boolean; warehouseIds: string[] }> {
  const [{ data: roleRow }, { data: whRows }] = await Promise.all([
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle(),
    supabaseAdmin.from("warehouse_managers").select("warehouse_id").eq("user_id", userId),
  ]);
  const isAdmin = !!roleRow;
  const warehouseIds = (whRows ?? []).map((r: any) => r.warehouse_id);
  if (!isAdmin && warehouseIds.length === 0) throw new Error("Admin or warehouse-manager role required");
  return { isAdmin, warehouseIds };
}


// ---------- Stats ----------
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { isAdmin, warehouseIds } = await ensureAdminOrManager(context.userId);

    // Catalog counts are global (visible to managers too)
    const [{ count: products }, { count: categories }] = await Promise.all([
      supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("categories").select("id", { count: "exact", head: true }),
    ]);

    // Orders + revenue: scoped to manager's warehouses if not admin
    // Revenue only counts successfully delivered orders
    let ordersQ = supabaseAdmin.from("orders").select("id", { count: "exact", head: true });
    let revQ = supabaseAdmin.from("orders").select("total").eq("status", "delivered");
    if (!isAdmin) {
      ordersQ = ordersQ.in("warehouse_id", warehouseIds);
      revQ = revQ.in("warehouse_id", warehouseIds);
    }
    const [{ count: orders }, { data: revRows }] = await Promise.all([ordersQ, revQ]);
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
    const { isAdmin, warehouseIds } = await ensureAdminOrManager(context.userId);
    let q = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!isAdmin) q = q.in("warehouse_id", warehouseIds);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const whIds = Array.from(new Set(rows.map((r: any) => r.warehouse_id).filter(Boolean))) as string[];
    const whMap = new Map<string, { name: string; code: string }>();
    if (whIds.length) {
      const { data: whs } = await supabaseAdmin
        .from("warehouses").select("id, name, code").in("id", whIds);
      (whs ?? []).forEach((w: any) => whMap.set(w.id, { name: w.name, code: w.code }));
    }
    return rows.map((r: any) => ({
      ...r,
      warehouse: r.warehouse_id ? whMap.get(r.warehouse_id) ?? null : null,
    }));
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
    const { isAdmin, warehouseIds } = await ensureAdminOrManager(context.userId);
    if (!isAdmin) {
      const { data: ord } = await supabaseAdmin.from("orders").select("warehouse_id").eq("id", data.id).maybeSingle();
      if (!ord || !ord.warehouse_id || !warehouseIds.includes(ord.warehouse_id)) {
        throw new Error("Not allowed for this order");
      }
    }
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
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    status: z.enum(["approved", "rejected", "pending"]),
    commission_rate: z.number().min(0).max(100).optional(),
    rejection_reason: z.string().trim().max(500).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const patch: Record<string, unknown> = { status: data.status };
    if (typeof data.commission_rate === "number") patch.commission_rate = data.commission_rate;
    if (data.status === "rejected") patch.rejection_reason = data.rejection_reason ?? null;
    if (data.status === "approved") patch.rejection_reason = null;
    const { data: r, error } = await supabaseAdmin
      .from("partner_restaurants")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
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
            ? `${r.name} was not approved. Reason: ${data.rejection_reason || "Please update your details."}`
            : `${r.name} is back in review.`,
        link: "/partner",
      });
    }
    return { ok: true };
  });

export const adminSetRestaurantBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), is_blocked: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: r, error } = await supabaseAdmin
      .from("partner_restaurants")
      .update({ is_blocked: data.is_blocked } as any)
      .eq("id", data.id)
      .select("owner_id, name")
      .single();
    if (error) throw new Error(error.message);
    if (r) {
      await supabaseAdmin.from("notifications").insert({
        user_id: r.owner_id,
        kind: "system",
        title: data.is_blocked ? "Restaurant locked" : "Restaurant unlocked",
        body: data.is_blocked
          ? `${r.name} has been locked by admin and is hidden from customers.`
          : `${r.name} has been unlocked and is visible to customers again.`,
        link: "/partner",
      });
    }
    return { ok: true };
  });

// Signed URL for any partner document (admin only)
export const adminGetDocSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: signed, error } = await supabaseAdmin.storage.from("partner-docs").createSignedUrl(data.path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

// ---------- Analytics ----------
export const adminAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const since = new Date();
    since.setDate(since.getDate() - data.days + 1);
    since.setHours(0, 0, 0, 0);
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id, total, subtotal, items, created_at, status, payment, restaurant_id, warehouse_id")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const list = (orders ?? []).filter((o: any) => o.status !== "cancelled");

    // Daily revenue series
    const byDay = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < data.days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const k = d.toISOString().slice(0, 10);
      byDay.set(k, { revenue: 0, orders: 0 });
    }
    for (const o of list) {
      const k = new Date(o.created_at).toISOString().slice(0, 10);
      const cur = byDay.get(k) ?? { revenue: 0, orders: 0 };
      cur.revenue += o.total ?? 0;
      cur.orders += 1;
      byDay.set(k, cur);
    }
    const series = Array.from(byDay.entries()).map(([date, v]) => ({ date, ...v }));

    // Top items
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const o of list) {
      const items = Array.isArray(o.items) ? o.items : [];
      for (const it of items as any[]) {
        const key = it.id ?? it.slug ?? it.name ?? "unknown";
        const name = it.name ?? "Item";
        const qty = Number(it.qty ?? it.quantity ?? 1);
        const price = Number(it.price ?? 0);
        const cur = itemMap.get(key) ?? { name, qty: 0, revenue: 0 };
        cur.qty += qty;
        cur.revenue += qty * price;
        itemMap.set(key, cur);
      }
    }
    const topItems = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Payment split
    const payments = new Map<string, number>();
    for (const o of list) payments.set(o.payment ?? "other", (payments.get(o.payment ?? "other") ?? 0) + 1);

    const revenue = list.reduce((s, o) => s + (o.total ?? 0), 0);
    const aov = list.length ? Math.round(revenue / list.length) : 0;

    return {
      revenue,
      orders: list.length,
      aov,
      series,
      topItems,
      paymentSplit: Array.from(payments.entries()).map(([k, v]) => ({ name: k, value: v })),
    };
  });

// ---------- Settlements (admin overview) ----------
export const adminSettlements = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const since = new Date();
    since.setDate(since.getDate() - data.days + 1);
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id, subtotal, total, restaurant_id, status, created_at")
      .gte("created_at", since.toISOString())
      .not("restaurant_id", "is", null);
    const { data: restos } = await supabaseAdmin
      .from("partner_restaurants")
      .select("id, name, commission_rate");
    const byResto = new Map<string, { name: string; commission_rate: number; gross: number; commission: number; payout: number; orders: number }>();
    for (const r of restos ?? []) byResto.set(r.id, { name: r.name, commission_rate: r.commission_rate ?? 0, gross: 0, commission: 0, payout: 0, orders: 0 });
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      const r = byResto.get(o.restaurant_id!);
      if (!r) continue;
      const gross = o.subtotal ?? 0;
      const commission = Math.round((gross * r.commission_rate) / 100);
      r.gross += gross;
      r.commission += commission;
      r.payout += gross - commission;
      r.orders += 1;
    }
    return Array.from(byResto.values()).filter((r) => r.orders > 0).sort((a, b) => b.payout - a.payout);
  });
