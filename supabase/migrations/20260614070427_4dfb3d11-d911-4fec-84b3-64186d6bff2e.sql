
-- Add 'rider' role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'rider';

-- Extend riders table for self-signup + approval + account linkage
ALTER TABLE public.riders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS rejection_reason text;

CREATE UNIQUE INDEX IF NOT EXISTS riders_user_id_unique ON public.riders(user_id) WHERE user_id IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON public.riders TO authenticated;
GRANT SELECT, UPDATE ON public.order_assignments TO authenticated;

-- RLS: rider can read & update own row; admin already has via has_role.
DROP POLICY IF EXISTS "rider can read own profile" ON public.riders;
CREATE POLICY "rider can read own profile" ON public.riders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "rider can apply (insert own)" ON public.riders;
CREATE POLICY "rider can apply (insert own)" ON public.riders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins manage riders" ON public.riders;
CREATE POLICY "admins manage riders" ON public.riders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;

-- order_assignments: rider can read & update status on own assignments
ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rider reads own assignments" ON public.order_assignments;
CREATE POLICY "rider reads own assignments" ON public.order_assignments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "rider updates own assignment status" ON public.order_assignments;
CREATE POLICY "rider updates own assignment status" ON public.order_assignments
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid())
  );

-- Allow riders to read order summaries for orders assigned to them
DROP POLICY IF EXISTS "rider reads assigned orders" ON public.orders;
CREATE POLICY "rider reads assigned orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.order_assignments a
      JOIN public.riders r ON r.id = a.rider_id
      WHERE a.order_id = orders.id AND r.user_id = auth.uid()
    )
  );

-- Helper: notify rider on assignment
CREATE OR REPLACE FUNCTION public.notify_rider_on_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid; v_total numeric;
BEGIN
  SELECT user_id INTO v_user FROM public.riders WHERE id = NEW.rider_id;
  IF v_user IS NULL THEN RETURN NEW; END IF;
  SELECT total INTO v_total FROM public.orders WHERE id = NEW.order_id;
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (v_user, 'order', 'New delivery assigned',
    'You have a new delivery of ₹' || COALESCE(v_total::text,'0') || '.',
    '/rider');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_rider_on_assignment ON public.order_assignments;
CREATE TRIGGER trg_notify_rider_on_assignment
AFTER INSERT OR UPDATE OF rider_id ON public.order_assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_rider_on_assignment();
