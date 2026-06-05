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

// ---------- Banners (public read + admin CRUD) ----------
export const listBanners = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("banners").select("*").eq("is_active", true).order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminListBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin.from("banners").select("*").order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const bannerInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(200).default(""),
  cta_label: z.string().trim().min(1).max(40).default("Shop now"),
  link_to: z.string().trim().min(1).max(200).default("/"),
  bg: z.string().trim().min(1).max(400),
  fg: z.string().trim().min(1).max(80),
  image: z.string().trim().max(400).default(""),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const adminSaveBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => bannerInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await supabaseAdmin.from("banners").upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("banners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Customers ----------
export const adminListCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ q: z.string().trim().max(120).default("") }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    if (data.q) q = q.or(`full_name.ilike.%${data.q}%,phone.ilike.%${data.q}%`);
    const { data: profiles, error } = await q;
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map((p) => p.id);
    const [{ data: roles }, { data: orders }] = await Promise.all([
      ids.length ? supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids) : Promise.resolve({ data: [] }),
      ids.length ? supabaseAdmin.from("orders").select("user_id, total, status").in("user_id", ids) : Promise.resolve({ data: [] }),
    ]) as any;
    const stats = new Map<string, { orders: number; spent: number }>();
    for (const o of orders ?? []) {
      if (o.status === "cancelled") continue;
      const cur = stats.get(o.user_id) ?? { orders: 0, spent: 0 };
      cur.orders += 1; cur.spent += o.total ?? 0;
      stats.set(o.user_id, cur);
    }
    const roleMap = new Map<string, string[]>();
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? []; arr.push(r.role); roleMap.set(r.user_id, arr);
    }
    return (profiles ?? []).map((p) => ({
      ...p,
      orders: stats.get(p.id)?.orders ?? 0,
      spent: stats.get(p.id)?.spent ?? 0,
      roles: roleMap.get(p.id) ?? [],
    }));
  });

export const adminSetCustomerBlocked = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), is_blocked: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("profiles").update({ is_blocked: data.is_blocked }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    user_id: z.string().uuid(),
    role: z.enum(["admin", "customer", "restaurant"]),
    grant: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.grant) {
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.user_id, role: data.role });
      if (error && !String(error.message).includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Refunds ----------
export const createRefundRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    order_id: z.string().uuid(),
    reason: z.string().trim().min(3).max(120),
    details: z.string().trim().max(1000).default(""),
    amount: z.number().int().min(0).max(10_000_000).default(0),
    proof_urls: z.array(z.string().trim().min(1).max(500)).max(5).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order, error: oErr } = await supabase.from("orders").select("id, total, user_id").eq("id", data.order_id).maybeSingle();
    if (oErr) throw new Error(oErr.message);
    if (!order) throw new Error("Order not found");
    const amount = data.amount > 0 ? data.amount : order.total;
    const { error } = await supabaseAdmin.from("refund_requests").insert({
      order_id: data.order_id, user_id: userId, reason: data.reason, details: data.details, amount,
      proof_urls: data.proof_urls,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });


export const myRefundForOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ order_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("refund_requests").select("*").eq("order_id", data.order_id).maybeSingle();
    return row ?? null;
  });

export const adminListRefunds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ status: z.enum(["pending", "approved", "rejected", "all"]).default("pending") }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    let q = supabaseAdmin.from("refund_requests").select("*").order("created_at", { ascending: false }).limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminResolveRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    status: z.enum(["approved", "rejected"]),
    admin_note: z.string().trim().max(1000).default(""),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.status === "approved") {
      const { data: cur } = await supabaseAdmin
        .from("refund_requests").select("verification_status").eq("id", data.id).maybeSingle();
      if ((cur?.verification_status ?? "pending") !== "verified") {
        throw new Error("Refund must be verified by warehouse/outlet manager first.");
      }
    }
    const { data: rr, error } = await supabaseAdmin.from("refund_requests")
      .update({ status: data.status, admin_note: data.admin_note }).eq("id", data.id).select("user_id, order_id, amount").single();
    if (error) throw new Error(error.message);

    if (rr) {
      await supabaseAdmin.from("notifications").insert({
        user_id: rr.user_id, kind: "system",
        title: data.status === "approved" ? "Refund approved" : "Refund rejected",
        body: data.status === "approved"
          ? `Your refund of ₹${rr.amount} has been approved.`
          : `Your refund request was rejected. ${data.admin_note || ""}`.trim(),
        link: `/orders/${rr.order_id}`,
      });
    }
    return { ok: true };
  });

// ---------- Inventory (low-stock) ----------
export const adminLowStock = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [{ data: stock }, { data: products }, { data: warehouses }] = await Promise.all([
      supabaseAdmin.from("product_stock").select("*"),
      supabaseAdmin.from("products").select("id, name, image, slug"),
      supabaseAdmin.from("warehouses").select("id, name, code"),
    ]);
    const pMap = new Map((products ?? []).map((p) => [p.id, p]));
    const wMap = new Map((warehouses ?? []).map((w) => [w.id, w]));
    return (stock ?? [])
      .filter((s) => s.qty <= s.low_stock_threshold)
      .map((s) => ({
        ...s,
        product: pMap.get(s.product_id) ?? null,
        warehouse: wMap.get(s.warehouse_id) ?? null,
      }))
      .sort((a, b) => a.qty - b.qty);
  });

export const adminReorderStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    warehouse_id: z.string().uuid(),
    product_id: z.string().uuid(),
    add_qty: z.number().int().min(1).max(100000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: cur } = await supabaseAdmin.from("product_stock").select("qty")
      .eq("warehouse_id", data.warehouse_id).eq("product_id", data.product_id).maybeSingle();
    const newQty = (cur?.qty ?? 0) + data.add_qty;
    const { error } = await supabaseAdmin.from("product_stock")
      .upsert({ warehouse_id: data.warehouse_id, product_id: data.product_id, qty: newQty } as any,
        { onConflict: "warehouse_id,product_id" });
    if (error) throw new Error(error.message);
    return { ok: true, qty: newQty };
  });

// ---------- Riders & Assignments ----------
const riderInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(6).max(20),
  vehicle: z.string().trim().min(1).max(40).default("bike"),
  vehicle_no: z.string().trim().max(40).default(""),
  is_active: z.boolean().default(true),
  notes: z.string().trim().max(500).default(""),
});

export const adminListRiders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [{ data: riders }, { data: assigns }] = await Promise.all([
      supabaseAdmin.from("riders").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("order_assignments").select("rider_id, status").in("status", ["assigned", "picked_up"]),
    ]);
    const active = new Map<string, number>();
    for (const a of assigns ?? []) active.set(a.rider_id, (active.get(a.rider_id) ?? 0) + 1);
    return (riders ?? []).map((r) => ({ ...r, active_orders: active.get(r.id) ?? 0 }));
  });

export const adminSaveRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => riderInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: row, error } = await supabaseAdmin.from("riders").upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("riders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminAssignableOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: orders } = await supabaseAdmin
      .from("orders").select("id, total, status, created_at, address, restaurant_id, warehouse_id")
      .in("status", ["placed", "packed", "out_for_delivery"])
      .order("created_at", { ascending: false }).limit(100);
    const ids = (orders ?? []).map((o) => o.id);
    const { data: assigns } = ids.length
      ? await supabaseAdmin.from("order_assignments").select("*, riders(name, phone)").in("order_id", ids)
      : { data: [] as any[] };
    const aMap = new Map((assigns ?? []).map((a: any) => [a.order_id, a]));
    return (orders ?? []).map((o) => ({ ...o, assignment: aMap.get(o.id) ?? null }));
  });

export const adminAssignRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ order_id: z.string().uuid(), rider_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("order_assignments")
      .upsert({ order_id: data.order_id, rider_id: data.rider_id, status: "assigned" } as any, { onConflict: "order_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    order_id: z.string().uuid(),
    status: z.enum(["assigned", "picked_up", "delivered", "cancelled"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const patch: any = { status: data.status };
    if (data.status === "picked_up") patch.picked_up_at = new Date().toISOString();
    if (data.status === "delivered") patch.delivered_at = new Date().toISOString();
    const { error } = await supabaseAdmin.from("order_assignments").update(patch).eq("order_id", data.order_id);
    if (error) throw new Error(error.message);
    if (data.status === "delivered") {
      await supabaseAdmin.from("orders").update({ status: "delivered" }).eq("id", data.order_id);
    } else if (data.status === "picked_up") {
      await supabaseAdmin.from("orders").update({ status: "out_for_delivery" }).eq("id", data.order_id);
    }
    return { ok: true };
  });

// ---------- Reports: GMV / coupon ROI / cohort retention ----------
export const adminReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().int().min(7).max(365).default(90) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const since = new Date();
    since.setDate(since.getDate() - data.days + 1);
    since.setHours(0, 0, 0, 0);

    const [{ data: orders }, { data: redemptions }, { data: coupons }] = await Promise.all([
      supabaseAdmin.from("orders").select("id, user_id, total, subtotal, status, created_at").gte("created_at", since.toISOString()),
      supabaseAdmin.from("coupon_redemptions").select("coupon_id, user_id, order_id, discount, created_at").gte("created_at", since.toISOString()),
      supabaseAdmin.from("coupons").select("id, code"),
    ]);

    const live = (orders ?? []).filter((o) => o.status === "delivered");

    // GMV by week
    const weekMap = new Map<string, { gmv: number; orders: number }>();
    for (const o of live) {
      const d = new Date(o.created_at);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay()); // start of week (Sun)
      const k = d.toISOString().slice(0, 10);
      const cur = weekMap.get(k) ?? { gmv: 0, orders: 0 };
      cur.gmv += o.total ?? 0; cur.orders += 1;
      weekMap.set(k, cur);
    }
    const gmvWeekly = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([week, v]) => ({ week, ...v }));
    const gmvTotal = live.reduce((s, o) => s + (o.total ?? 0), 0);

    // Coupon ROI
    const codeMap = new Map((coupons ?? []).map((c) => [c.id, c.code]));
    const orderToTotal = new Map(live.map((o) => [o.id, o.total ?? 0]));
    const couponAgg = new Map<string, { code: string; uses: number; discount: number; revenue: number }>();
    for (const r of redemptions ?? []) {
      const code = codeMap.get(r.coupon_id) ?? "—";
      const cur = couponAgg.get(r.coupon_id) ?? { code, uses: 0, discount: 0, revenue: 0 };
      cur.uses += 1; cur.discount += r.discount ?? 0;
      if (r.order_id && orderToTotal.has(r.order_id)) cur.revenue += orderToTotal.get(r.order_id)!;
      couponAgg.set(r.coupon_id, cur);
    }
    const couponROI = Array.from(couponAgg.values()).map((c) => ({
      ...c, roi: c.discount > 0 ? Math.round(((c.revenue - c.discount) / c.discount) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);

    // Cohort retention (monthly): first-order month → repeat order in next 1/2/3 months
    const userFirstMonth = new Map<string, string>();
    const userMonths = new Map<string, Set<string>>();
    for (const o of live) {
      const m = o.created_at.slice(0, 7);
      const prev = userFirstMonth.get(o.user_id);
      if (!prev || m < prev) userFirstMonth.set(o.user_id, m);
      const set = userMonths.get(o.user_id) ?? new Set<string>();
      set.add(m); userMonths.set(o.user_id, set);
    }
    const cohortMap = new Map<string, { size: number; m1: number; m2: number; m3: number }>();
    for (const [uid, m0] of userFirstMonth.entries()) {
      const cur = cohortMap.get(m0) ?? { size: 0, m1: 0, m2: 0, m3: 0 };
      cur.size += 1;
      const months = userMonths.get(uid)!;
      const next = (n: number) => {
        const d = new Date(m0 + "-01"); d.setMonth(d.getMonth() + n);
        return d.toISOString().slice(0, 7);
      };
      if (months.has(next(1))) cur.m1 += 1;
      if (months.has(next(2))) cur.m2 += 1;
      if (months.has(next(3))) cur.m3 += 1;
      cohortMap.set(m0, cur);
    }
    const cohorts = Array.from(cohortMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([cohort, v]) => ({
      cohort, size: v.size,
      m1: v.size ? Math.round((v.m1 / v.size) * 100) : 0,
      m2: v.size ? Math.round((v.m2 / v.size) * 100) : 0,
      m3: v.size ? Math.round((v.m3 / v.size) * 100) : 0,
    }));

    return { gmvTotal, gmvWeekly, couponROI, cohorts };
  });

// ---------- Manager-side refund verification ----------
export const managerListRefundsToVerify = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    // RLS scopes to refunds the warehouse/outlet manager can see.
    const { data, error } = await supabase
      .from("refund_requests").select("*").order("created_at", { ascending: false }).limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const managerVerifyRefund = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    status: z.enum(["verified", "rejected"]),
    verifier_note: z.string().trim().max(1000).default(""),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch = {
      verification_status: data.status,
      verifier_note: data.verifier_note,
      verified_by: userId,
      verified_at: new Date().toISOString(),
      ...(data.status === "rejected"
        ? { status: "rejected", admin_note: `Rejected by manager: ${data.verifier_note}` }
        : {}),
    };
    const { data: row, error } = await supabase
      .from("refund_requests").update(patch as never).eq("id", data.id).select("user_id, order_id").maybeSingle();

    if (error) throw new Error(error.message);
    if (row) {
      await supabaseAdmin.from("notifications").insert({
        user_id: row.user_id,
        kind: "order",
        title: data.status === "verified" ? "Refund verified" : "Refund rejected",
        body: data.status === "verified"
          ? "Your refund request was verified and forwarded to admin for processing."
          : (data.verifier_note || "Your refund request was rejected after review."),
        link: `/orders/${row.order_id}`,
      });
    }
    return { ok: true };
  });
