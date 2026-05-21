import { supabase } from "@/integrations/supabase/client";

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
};

export type UserCouponUsage = Record<string, number>;

const couponFields =
  "id,code,description,discount_type,discount_value,min_order,max_discount,usage_limit,per_user_limit,used_count,valid_from,valid_until,is_active";

export async function listActiveCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select(couponFields)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as Coupon[]).filter(isCouponUsableNow);
}

export function couponLabel(coupon: Coupon) {
  return coupon.discount_type === "percent"
    ? `${coupon.discount_value}% OFF`
    : `₹${coupon.discount_value} OFF`;
}

export function couponDescription(coupon: Coupon) {
  if (coupon.description?.trim()) return coupon.description;
  const cap = coupon.max_discount ? ` up to ₹${coupon.max_discount}` : "";
  return `${couponLabel(coupon)}${cap} on orders above ₹${coupon.min_order}`;
}

export function isCouponAvailableForUser(coupon: Coupon, usage: UserCouponUsage = {}) {
  if (coupon.per_user_limit == null) return true;
  return (usage[coupon.id] ?? 0) < coupon.per_user_limit;
}

export function applyCoupon(
  coupons: Coupon[],
  code: string,
  subtotal: number,
  usage: UserCouponUsage = {},
): { ok: boolean; discount: number; coupon?: Coupon; reason?: string } {
  const normalized = code.trim().toUpperCase();
  const coupon = coupons.find((item) => item.code.toUpperCase() === normalized);

  if (!coupon) return { ok: false, discount: 0, reason: "Invalid code" };
  if (!isCouponUsableNow(coupon)) return { ok: false, discount: 0, reason: "Coupon is not available" };
  if (!isCouponAvailableForUser(coupon, usage)) {
    return { ok: false, discount: 0, coupon, reason: "You've already used this coupon" };
  }
  if (subtotal < coupon.min_order) {
    return { ok: false, discount: 0, coupon, reason: `Minimum order ₹${coupon.min_order}` };
  }

  let discount =
    coupon.discount_type === "flat"
      ? coupon.discount_value
      : Math.round((coupon.discount_value / 100) * subtotal);

  if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  discount = Math.min(discount, subtotal);

  return { ok: true, discount, coupon };
}

function isCouponUsableNow(coupon: Coupon) {
  const now = Date.now();
  const startsAt = new Date(coupon.valid_from).getTime();
  const endsAt = coupon.valid_until ? new Date(coupon.valid_until).getTime() : null;
  const hasUsesLeft = coupon.usage_limit == null || coupon.used_count < coupon.usage_limit;

  return coupon.is_active && startsAt <= now && (endsAt == null || endsAt > now) && hasUsesLeft;
}
