
-- Add 'restaurant' role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'restaurant';

-- partner_restaurants table
CREATE TABLE public.partner_restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  cuisines text[] NOT NULL DEFAULT '{}',
  image text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  rating numeric NOT NULL DEFAULT 4.5,
  reviews_count integer NOT NULL DEFAULT 0,
  eta_mins integer NOT NULL DEFAULT 30,
  cost_for_two integer NOT NULL DEFAULT 400,
  veg boolean NOT NULL DEFAULT false,
  price_tier smallint NOT NULL DEFAULT 2,
  offer text,
  area text NOT NULL DEFAULT '',
  distance_km numeric NOT NULL DEFAULT 1.0,
  opens_at text,
  closes_at text,
  is_open boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_restaurants_owner ON public.partner_restaurants(owner_id);
CREATE INDEX idx_partner_restaurants_status ON public.partner_restaurants(status);

ALTER TABLE public.partner_restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_restaurants_public_read_approved"
  ON public.partner_restaurants FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "partner_restaurants_owner_read"
  ON public.partner_restaurants FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "partner_restaurants_owner_insert"
  ON public.partner_restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "partner_restaurants_owner_update"
  ON public.partner_restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "partner_restaurants_admin_all"
  ON public.partner_restaurants FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_partner_restaurants_updated
  BEFORE UPDATE ON public.partner_restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- partner_dishes table
CREATE TABLE public.partner_dishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.partner_restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  price integer NOT NULL,
  mrp integer,
  veg boolean NOT NULL DEFAULT true,
  spicy boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  rating numeric NOT NULL DEFAULT 4.5,
  section text NOT NULL DEFAULT 'Mains',
  in_stock boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_dishes_restaurant ON public.partner_dishes(restaurant_id);

ALTER TABLE public.partner_dishes ENABLE ROW LEVEL SECURITY;

-- Helper function: does the current user own this restaurant?
CREATE OR REPLACE FUNCTION public.owns_restaurant(_user_id uuid, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_restaurants WHERE id = _restaurant_id AND owner_id = _user_id)
$$;

CREATE POLICY "partner_dishes_public_read"
  ON public.partner_dishes FOR SELECT
  TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.partner_restaurants r WHERE r.id = restaurant_id AND r.status = 'approved'));

CREATE POLICY "partner_dishes_owner_all"
  ON public.partner_dishes FOR ALL
  TO authenticated
  USING (owns_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (owns_restaurant(auth.uid(), restaurant_id));

CREATE POLICY "partner_dishes_admin_all"
  ON public.partner_dishes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_partner_dishes_updated
  BEFORE UPDATE ON public.partner_dishes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- partner_dish_variants table
CREATE TABLE public.partner_dish_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid NOT NULL REFERENCES public.partner_dishes(id) ON DELETE CASCADE,
  name text NOT NULL,
  price integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_dish_variants_dish ON public.partner_dish_variants(dish_id);

ALTER TABLE public.partner_dish_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_dish_variants_public_read"
  ON public.partner_dish_variants FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partner_dishes d
    JOIN public.partner_restaurants r ON r.id = d.restaurant_id
    WHERE d.id = dish_id AND r.status = 'approved'
  ));

CREATE POLICY "partner_dish_variants_owner_all"
  ON public.partner_dish_variants FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partner_dishes d
    WHERE d.id = dish_id AND owns_restaurant(auth.uid(), d.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.partner_dishes d
    WHERE d.id = dish_id AND owns_restaurant(auth.uid(), d.restaurant_id)
  ));

-- partner_dish_addons table
CREATE TABLE public.partner_dish_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id uuid NOT NULL REFERENCES public.partner_dishes(id) ON DELETE CASCADE,
  name text NOT NULL,
  price integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_dish_addons_dish ON public.partner_dish_addons(dish_id);

ALTER TABLE public.partner_dish_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_dish_addons_public_read"
  ON public.partner_dish_addons FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partner_dishes d
    JOIN public.partner_restaurants r ON r.id = d.restaurant_id
    WHERE d.id = dish_id AND r.status = 'approved'
  ));

CREATE POLICY "partner_dish_addons_owner_all"
  ON public.partner_dish_addons FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.partner_dishes d
    WHERE d.id = dish_id AND owns_restaurant(auth.uid(), d.restaurant_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.partner_dishes d
    WHERE d.id = dish_id AND owns_restaurant(auth.uid(), d.restaurant_id)
  ));

-- Add restaurant_id to orders so owners can see their orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS restaurant_id uuid;
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);

CREATE POLICY "orders_restaurant_owner_select"
  ON public.orders FOR SELECT
  TO authenticated
  USING (restaurant_id IS NOT NULL AND owns_restaurant(auth.uid(), restaurant_id));

CREATE POLICY "orders_restaurant_owner_update"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (restaurant_id IS NOT NULL AND owns_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (restaurant_id IS NOT NULL AND owns_restaurant(auth.uid(), restaurant_id));

-- Notify restaurant owner of new orders
CREATE OR REPLACE FUNCTION public.notify_restaurant_on_order()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_name text;
BEGIN
  IF NEW.restaurant_id IS NULL THEN RETURN NEW; END IF;
  SELECT owner_id, name INTO v_owner, v_name FROM public.partner_restaurants WHERE id = NEW.restaurant_id;
  IF v_owner IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (
    v_owner, 'order',
    'New order received',
    'A customer ordered ₹' || NEW.total::text || ' from ' || COALESCE(v_name, 'your restaurant') || '.',
    '/partner/orders'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_restaurant_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_restaurant_on_order();

-- Wire customer-facing notification (notify_on_order) if not already attached
DROP TRIGGER IF EXISTS trg_notify_on_order ON public.orders;
CREATE TRIGGER trg_notify_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_order();
