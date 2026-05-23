
-- Outlet managers table
CREATE TABLE public.partner_outlet_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid NOT NULL,
  restaurant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'manager',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (outlet_id, user_id)
);

CREATE INDEX idx_pom_user ON public.partner_outlet_managers(user_id);
CREATE INDEX idx_pom_outlet ON public.partner_outlet_managers(outlet_id);
CREATE INDEX idx_pom_restaurant ON public.partner_outlet_managers(restaurant_id);

ALTER TABLE public.partner_outlet_managers ENABLE ROW LEVEL SECURITY;

-- Security definer helpers
CREATE OR REPLACE FUNCTION public.manages_outlet(_user_id uuid, _outlet_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_outlet_managers
                 WHERE user_id = _user_id AND outlet_id = _outlet_id);
$$;

CREATE OR REPLACE FUNCTION public.is_outlet_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_outlet_managers WHERE user_id = _user_id);
$$;

-- RLS on partner_outlet_managers
CREATE POLICY pom_admin_all ON public.partner_outlet_managers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY pom_owner_all ON public.partner_outlet_managers
  FOR ALL TO authenticated
  USING (owns_restaurant(auth.uid(), restaurant_id))
  WITH CHECK (owns_restaurant(auth.uid(), restaurant_id));

CREATE POLICY pom_select_own ON public.partner_outlet_managers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Extend orders RLS for outlet managers
CREATE POLICY orders_outlet_manager_select ON public.orders
  FOR SELECT TO authenticated
  USING (outlet_id IS NOT NULL AND manages_outlet(auth.uid(), outlet_id));

CREATE POLICY orders_outlet_manager_update ON public.orders
  FOR UPDATE TO authenticated
  USING (outlet_id IS NOT NULL AND manages_outlet(auth.uid(), outlet_id))
  WITH CHECK (outlet_id IS NOT NULL AND manages_outlet(auth.uid(), outlet_id));

-- Extend partner_dishes RLS for outlet managers (manage dishes for their outlet only)
CREATE POLICY partner_dishes_outlet_manager_update ON public.partner_dishes
  FOR UPDATE TO authenticated
  USING (outlet_id IS NOT NULL AND manages_outlet(auth.uid(), outlet_id))
  WITH CHECK (outlet_id IS NOT NULL AND manages_outlet(auth.uid(), outlet_id));

-- Order assignments visibility for outlet managers
CREATE POLICY oa_outlet_manager_read ON public.order_assignments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_assignments.order_id
      AND o.outlet_id IS NOT NULL
      AND manages_outlet(auth.uid(), o.outlet_id)
  ));

-- Notify outlet managers on new orders
CREATE OR REPLACE FUNCTION public.notify_outlet_managers_on_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_mgr record;
  v_outlet text;
BEGIN
  IF NEW.outlet_id IS NULL THEN RETURN NEW; END IF;
  SELECT name INTO v_outlet FROM public.partner_outlets WHERE id = NEW.outlet_id;
  FOR v_mgr IN SELECT user_id FROM public.partner_outlet_managers WHERE outlet_id = NEW.outlet_id LOOP
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (
      v_mgr.user_id, 'order', 'New order received',
      'A customer ordered ₹' || NEW.total::text ||
        CASE WHEN v_outlet IS NOT NULL THEN ' at ' || v_outlet ELSE '' END || '.',
      '/outlet/orders'
    );
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_outlet_managers_on_order ON public.orders;
CREATE TRIGGER trg_notify_outlet_managers_on_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_outlet_managers_on_order();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_outlet_managers;
