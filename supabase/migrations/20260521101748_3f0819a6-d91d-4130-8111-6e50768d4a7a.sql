
-- ============ WAREHOUSES ============
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  pincode text NOT NULL DEFAULT '',
  lat numeric,
  lng numeric,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "warehouses_public_read_active" ON public.warehouses
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "warehouses_admin_all" ON public.warehouses
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WAREHOUSE PINCODES ============
CREATE TABLE public.warehouse_pincodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  pincode text NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, pincode)
);
CREATE INDEX idx_wh_pincodes_pincode ON public.warehouse_pincodes(pincode);
ALTER TABLE public.warehouse_pincodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wh_pincodes_public_read" ON public.warehouse_pincodes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "wh_pincodes_admin_all" ON public.warehouse_pincodes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ============ PRODUCT STOCK ============
CREATE TABLE public.product_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (warehouse_id, product_id)
);
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_stock_public_read" ON public.product_stock
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "product_stock_admin_all" ON public.product_stock
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_product_stock_updated_at
  BEFORE UPDATE ON public.product_stock
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PARTNER OUTLETS ============
CREATE TABLE public.partner_outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.partner_restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL DEFAULT '',
  area text NOT NULL DEFAULT '',
  pincode text NOT NULL DEFAULT '',
  lat numeric,
  lng numeric,
  eta_mins integer NOT NULL DEFAULT 30,
  is_open boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_outlets_restaurant ON public.partner_outlets(restaurant_id);
ALTER TABLE public.partner_outlets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_outlets_public_read" ON public.partner_outlets
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM partner_restaurants r
    WHERE r.id = partner_outlets.restaurant_id AND r.status = 'approved'
  ));
CREATE POLICY "partner_outlets_owner_all" ON public.partner_outlets
  FOR ALL TO authenticated
  USING (owns_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (owns_restaurant(auth.uid(), restaurant_id));
CREATE POLICY "partner_outlets_admin_all" ON public.partner_outlets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_partner_outlets_updated_at
  BEFORE UPDATE ON public.partner_outlets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DISH -> OUTLET ============
ALTER TABLE public.partner_dishes
  ADD COLUMN outlet_id uuid REFERENCES public.partner_outlets(id) ON DELETE SET NULL;

-- ============ ORDER -> WAREHOUSE/OUTLET ============
ALTER TABLE public.orders
  ADD COLUMN warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL,
  ADD COLUMN outlet_id uuid REFERENCES public.partner_outlets(id) ON DELETE SET NULL;

-- ============ RESOLVERS ============
-- Best warehouse for a pincode: exact pincode mapping first (by priority),
-- else any active warehouse (by sort_order).
CREATE OR REPLACE FUNCTION public.resolve_warehouse_for_pincode(_pincode text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.id FROM warehouses w
  JOIN warehouse_pincodes wp ON wp.warehouse_id = w.id
  WHERE w.is_active = true AND wp.pincode = _pincode
  ORDER BY wp.priority DESC, w.sort_order ASC
  LIMIT 1;
$$;

-- Nearest outlet by lat/lng (haversine, km); falls back to first active outlet
CREATE OR REPLACE FUNCTION public.resolve_outlet_for_restaurant(
  _restaurant_id uuid, _lat numeric DEFAULT NULL, _lng numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id uuid;
BEGIN
  IF _lat IS NOT NULL AND _lng IS NOT NULL THEN
    SELECT o.id INTO v_id FROM partner_outlets o
    WHERE o.restaurant_id = _restaurant_id AND o.is_active = true
      AND o.lat IS NOT NULL AND o.lng IS NOT NULL
    ORDER BY (
      6371 * acos(
        cos(radians(_lat)) * cos(radians(o.lat)) *
        cos(radians(o.lng) - radians(_lng)) +
        sin(radians(_lat)) * sin(radians(o.lat))
      )
    ) ASC
    LIMIT 1;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;
  SELECT id INTO v_id FROM partner_outlets
  WHERE restaurant_id = _restaurant_id AND is_active = true
  ORDER BY sort_order ASC, created_at ASC LIMIT 1;
  RETURN v_id;
END $$;

-- Atomic stock decrement for grocery checkout
-- items: jsonb array of { product_id: uuid, qty: int }
CREATE OR REPLACE FUNCTION public.decrement_warehouse_stock(_warehouse_id uuid, _items jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r record;
BEGIN
  FOR r IN SELECT (value->>'product_id')::uuid AS pid, (value->>'qty')::int AS q
           FROM jsonb_array_elements(_items)
  LOOP
    UPDATE product_stock
       SET qty = qty - r.q
     WHERE warehouse_id = _warehouse_id AND product_id = r.pid AND qty >= r.q;
    IF NOT FOUND THEN
      -- If no stock row exists yet, treat as unlimited (skip). Otherwise insufficient.
      IF EXISTS (SELECT 1 FROM product_stock WHERE warehouse_id = _warehouse_id AND product_id = r.pid) THEN
        RAISE EXCEPTION 'Insufficient stock for product %', r.pid;
      END IF;
    END IF;
  END LOOP;
END $$;
