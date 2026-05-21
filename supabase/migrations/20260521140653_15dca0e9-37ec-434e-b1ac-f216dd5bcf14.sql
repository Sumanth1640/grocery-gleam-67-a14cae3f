
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS per_user_limit integer;

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid,
  discount integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_coupon
  ON public.coupon_redemptions(user_id, coupon_id);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "redemptions_select_own"
  ON public.coupon_redemptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "redemptions_insert_own"
  ON public.coupon_redemptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "redemptions_admin_all"
  ON public.coupon_redemptions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
