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

const couponInput = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).max(40).regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, - or _"),
  description: z.string().trim().max(200).default(""),
  discount_type: z.enum(["percent", "flat"]),
  discount_value: z.number().int().min(0).max(1_000_000),
  min_order: z.number().int().min(0).max(1_000_000).default(0),
  max_discount: z.number().int().min(0).max(1_000_000).nullable().optional(),
  usage_limit: z.number().int().min(0).max(1_000_000).nullable().optional(),
  per_user_limit: z.number().int().min(0).max(1_000_000).nullable().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const adminListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => couponInput.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload: any = { ...data, code: data.code.toUpperCase() };
    const { data: row, error } = await supabaseAdmin
      .from("coupons")
      .upsert(payload, { onConflict: "code" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Returns a map of { coupon_id: timesUsed } for the current user.
export const listMyCouponUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("coupon_redemptions")
      .select("coupon_id")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const map: Record<string, number> = {};
    for (const r of (data ?? []) as { coupon_id: string }[]) {
      map[r.coupon_id] = (map[r.coupon_id] ?? 0) + 1;
    }
    return map;
  });
