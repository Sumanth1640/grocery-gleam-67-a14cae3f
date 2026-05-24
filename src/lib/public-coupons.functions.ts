import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Returns only display-safe coupon fields, pre-filtered to currently usable coupons.
// Sensitive internals (usage_limit, used_count) stay server-side.
export const listPublicCoupons = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("id, code, description, discount_type, discount_value, min_order, max_discount, per_user_limit, valid_from, valid_until, is_active, usage_limit, used_count")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const now = Date.now();
    return (data ?? [])
      .filter((c: any) => {
        const startsAt = new Date(c.valid_from).getTime();
        const endsAt = c.valid_until ? new Date(c.valid_until).getTime() : null;
        const hasUsesLeft = c.usage_limit == null || c.used_count < c.usage_limit;
        return startsAt <= now && (endsAt == null || endsAt > now) && hasUsesLeft;
      })
      .map((c: any) => ({
        id: c.id,
        code: c.code,
        description: c.description,
        discount_type: c.discount_type,
        discount_value: c.discount_value,
        min_order: c.min_order,
        max_discount: c.max_discount,
        per_user_limit: c.per_user_limit,
        valid_until: c.valid_until,
      }));
  });
