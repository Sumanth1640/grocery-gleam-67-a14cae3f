import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ensureAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

// ---------- Rider: my earnings ----------
export const riderMyEarnings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rider } = await supabaseAdmin
      .from("riders").select("id").eq("user_id", userId).maybeSingle();
    if (!rider) return { rows: [], summary: { today: 0, week: 0, month: 0, pending: 0, paid: 0 } };
    const { data: rows } = await supabaseAdmin
      .from("rider_earnings")
      .select("id, order_id, base_fee, total, status, earned_at")
      .eq("rider_id", rider.id)
      .order("earned_at", { ascending: false })
      .limit(100);
    const list = rows ?? [];
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 6); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sum = (filter: (r: any) => boolean) =>
      list.filter(filter).reduce((a, r) => a + Number(r.total || 0), 0);
    return {
      rows: list,
      summary: {
        today: sum((r) => new Date(r.earned_at) >= startOfDay),
        week: sum((r) => new Date(r.earned_at) >= startOfWeek),
        month: sum((r) => new Date(r.earned_at) >= startOfMonth),
        pending: sum((r) => r.status === "pending"),
        paid: sum((r) => r.status === "paid"),
      },
    };
  });

// ---------- Admin: list pending earnings grouped by rider ----------
export const adminListPendingEarnings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("rider_earnings")
      .select("id, rider_id, total, status, earned_at, order_id, riders(name, phone, vehicle, vehicle_no)")
      .eq("status", "pending")
      .order("earned_at", { ascending: false });
    const groups = new Map<string, any>();
    for (const r of rows ?? []) {
      const k = r.rider_id;
      if (!groups.has(k)) {
        groups.set(k, {
          rider_id: k,
          rider: (r as any).riders,
          count: 0,
          total: 0,
          earliest: r.earned_at,
          latest: r.earned_at,
          earnings: [] as any[],
        });
      }
      const g = groups.get(k);
      g.count += 1;
      g.total += Number(r.total || 0);
      if (r.earned_at < g.earliest) g.earliest = r.earned_at;
      if (r.earned_at > g.latest) g.latest = r.earned_at;
      g.earnings.push(r);
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
  });

// ---------- Admin: list payout history ----------
export const adminListPayouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("rider_payouts")
      .select("id, rider_id, amount, period_start, period_end, status, paid_at, notes, riders(name, phone)")
      .order("paid_at", { ascending: false })
      .limit(100);
    return data ?? [];
  });

// ---------- Admin: pay rider (mark all pending as paid) ----------
const payInput = z.object({
  rider_id: z.string().uuid(),
  notes: z.string().trim().max(300).default(""),
});
export const adminPayRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => payInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pending } = await supabaseAdmin
      .from("rider_earnings")
      .select("id, total, earned_at")
      .eq("rider_id", data.rider_id)
      .eq("status", "pending");
    const rows = pending ?? [];
    if (!rows.length) throw new Error("Nothing to pay out");
    const amount = rows.reduce((a, r) => a + Number(r.total || 0), 0);
    const dates = rows.map((r) => r.earned_at).sort();
    const { data: payout, error } = await supabaseAdmin
      .from("rider_payouts")
      .insert({
        rider_id: data.rider_id,
        amount,
        period_start: dates[0],
        period_end: dates[dates.length - 1],
        status: "paid",
        paid_at: new Date().toISOString(),
        notes: data.notes || null,
      })
      .select().single();
    if (error) throw new Error(error.message);
    const { error: uErr } = await supabaseAdmin
      .from("rider_earnings")
      .update({ status: "paid", payout_id: payout.id })
      .in("id", rows.map((r) => r.id));
    if (uErr) throw new Error(uErr.message);
    // Notify rider
    const { data: rider } = await supabaseAdmin
      .from("riders").select("user_id").eq("id", data.rider_id).maybeSingle();
    if (rider?.user_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: rider.user_id, kind: "system",
        title: "Payout received 💰",
        body: `₹${amount.toFixed(2)} has been paid out to you.`,
        link: "/rider",
      });
    }
    return { ok: true, amount, count: rows.length };
  });

// ---------- Admin: get/set the flat fee setting ----------
export const adminGetRiderFee = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("app_settings").select("value").eq("key", "rider_flat_fee").maybeSingle();
    return { fee: data?.value ? Number(data.value as any) : 40 };
  });

export const adminSetRiderFee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ fee: z.number().min(0).max(10000) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "rider_flat_fee", value: data.fee as any, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
