
-- 1. Banners (homepage CMS)
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Shop now',
  link_to text NOT NULL DEFAULT '/',
  bg text NOT NULL DEFAULT 'linear-gradient(135deg, oklch(0.92 0.13 80), oklch(0.88 0.16 50))',
  fg text NOT NULL DEFAULT 'oklch(0.25 0.05 40)',
  image text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY banners_public_read ON public.banners FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY banners_admin_all ON public.banners FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Customer block flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;
CREATE POLICY profiles_admin_read ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- 3. Refund requests
CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  details text NOT NULL DEFAULT '',
  amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  admin_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY refund_insert_own ON public.refund_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY refund_select_own ON public.refund_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY refund_admin_all ON public.refund_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER refund_updated_at BEFORE UPDATE ON public.refund_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_refund_status ON public.refund_requests(status, created_at DESC);

-- 4. Riders
CREATE TABLE public.riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  vehicle text NOT NULL DEFAULT 'bike',
  vehicle_no text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
CREATE POLICY riders_admin_all ON public.riders FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY riders_partner_read ON public.riders FOR SELECT TO authenticated USING (is_active = true);
CREATE TRIGGER riders_updated_at BEFORE UPDATE ON public.riders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Order assignments
CREATE TABLE public.order_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  rider_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'assigned', -- assigned | picked_up | delivered | cancelled
  assigned_at timestamptz NOT NULL DEFAULT now(),
  picked_up_at timestamptz,
  delivered_at timestamptz,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY oa_admin_all ON public.order_assignments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY oa_customer_read ON public.order_assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_assignments.order_id AND o.user_id = auth.uid()));
CREATE POLICY oa_restaurant_read ON public.order_assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_assignments.order_id AND o.restaurant_id IS NOT NULL AND owns_restaurant(auth.uid(), o.restaurant_id)));
CREATE POLICY oa_warehouse_read ON public.order_assignments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_assignments.order_id AND o.warehouse_id IS NOT NULL AND manages_warehouse(auth.uid(), o.warehouse_id)));
CREATE TRIGGER oa_updated_at BEFORE UPDATE ON public.order_assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_oa_rider ON public.order_assignments(rider_id, status);

-- 6. Block check helper for orders insert
CREATE OR REPLACE FUNCTION public.block_orders_for_blocked_users()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND is_blocked = true) THEN
    RAISE EXCEPTION 'Account is blocked';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER orders_block_check BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.block_orders_for_blocked_users();
