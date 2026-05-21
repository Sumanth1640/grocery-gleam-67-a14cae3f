
-- Warehouse manager mapping
CREATE TABLE public.warehouse_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  warehouse_id uuid NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, warehouse_id)
);

ALTER TABLE public.warehouse_managers ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.manages_warehouse(_user_id uuid, _warehouse_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.warehouse_managers
                 WHERE user_id = _user_id AND warehouse_id = _warehouse_id);
$$;

CREATE OR REPLACE FUNCTION public.is_warehouse_manager(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.warehouse_managers WHERE user_id = _user_id);
$$;

-- RLS for warehouse_managers
CREATE POLICY wm_admin_all ON public.warehouse_managers
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY wm_select_own ON public.warehouse_managers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Extend orders RLS so warehouse managers can view/update their warehouse's orders
CREATE POLICY orders_warehouse_manager_select ON public.orders
  FOR SELECT TO authenticated
  USING (warehouse_id IS NOT NULL AND manages_warehouse(auth.uid(), warehouse_id));

CREATE POLICY orders_warehouse_manager_update ON public.orders
  FOR UPDATE TO authenticated
  USING (warehouse_id IS NOT NULL AND manages_warehouse(auth.uid(), warehouse_id))
  WITH CHECK (warehouse_id IS NOT NULL AND manages_warehouse(auth.uid(), warehouse_id));

-- Trigger to notify warehouse managers on product order
CREATE OR REPLACE FUNCTION public.notify_warehouse_on_order()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_wh_name text;
  v_mgr record;
BEGIN
  IF NEW.warehouse_id IS NULL OR NEW.restaurant_id IS NOT NULL THEN
    RETURN NEW;
  END IF;
  SELECT name INTO v_wh_name FROM public.warehouses WHERE id = NEW.warehouse_id;
  FOR v_mgr IN SELECT user_id FROM public.warehouse_managers WHERE warehouse_id = NEW.warehouse_id LOOP
    INSERT INTO public.notifications (user_id, kind, title, body, link)
    VALUES (
      v_mgr.user_id, 'order',
      'New product order',
      'A customer placed an order of ₹' || NEW.total::text ||
        CASE WHEN v_wh_name IS NOT NULL THEN ' at ' || v_wh_name ELSE '' END || '.',
      '/admin/orders'
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_warehouse_on_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_warehouse_on_order();

-- Allow warehouse managers + admins to insert notifications targeting any user (needed because trigger runs as the inserting user when not SECURITY DEFINER on notifications insert path)
-- The trigger function above does not run as SECURITY DEFINER on notifications table because notifications RLS only allows self-insert.
-- Fix: make the function SECURITY DEFINER so it bypasses RLS for notification insertion.
ALTER FUNCTION public.notify_warehouse_on_order() SECURITY DEFINER;

-- Add orders -> warehouses realtime ensure (orders already broadcast since partner alerts work)
-- Ensure realtime publication includes orders (idempotent: error if already added — wrap)
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
