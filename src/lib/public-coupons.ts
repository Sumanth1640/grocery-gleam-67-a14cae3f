import { dualApi } from "@/lib/dual-api";

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  per_user_limit: number | null;
  valid_until: string | null;
};

export type UserCouponUsage = Record<string, number>;

export async function listActiveCoupons(): Promise<Coupon[]> {
  try {
    const data = await dualApi.listCoupons();
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      id: c.id ?? c.code,
      code: c.code,
      description: c.description ?? c.title ?? null,
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value) || 0,
      min_order: Number(c.min_order) || 0,
      max_discount: c.max_discount != null ? Number(c.max_discount) : null,
      per_user_limit: c.per_user_limit != null ? Number(c.per_user_limit) : null,
      valid_until: c.valid_until ?? c.expires_at ?? null,
    }));
  } catch {
    return [];
  }
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
