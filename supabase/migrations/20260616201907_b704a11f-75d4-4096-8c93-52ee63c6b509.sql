
-- Settings table for tunable numbers
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone signed in can read settings" ON public.app_settings;
CREATE POLICY "Anyone signed in can read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage settings" ON public.app_settings;
CREATE POLICY "Admins manage settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings(key, value) VALUES ('rider_flat_fee', '40'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Earnings (one row per delivered order)
CREATE TABLE IF NOT EXISTS public.rider_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  base_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
  payout_id uuid,
  earned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id)
);
CREATE INDEX IF NOT EXISTS idx_rider_earnings_rider_status ON public.rider_earnings(rider_id, status);
GRANT SELECT ON public.rider_earnings TO authenticated;
GRANT ALL ON public.rider_earnings TO service_role;
ALTER TABLE public.rider_earnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Rider sees own earnings" ON public.rider_earnings;
CREATE POLICY "Rider sees own earnings" ON public.rider_earnings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage earnings" ON public.rider_earnings;
CREATE POLICY "Admins manage earnings" ON public.rider_earnings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payouts
CREATE TABLE IF NOT EXISTS public.rider_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  period_start timestamptz,
  period_end timestamptz,
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid')),
  paid_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rider_payouts_rider ON public.rider_payouts(rider_id, paid_at DESC);
GRANT SELECT ON public.rider_payouts TO authenticated;
GRANT ALL ON public.rider_payouts TO service_role;
ALTER TABLE public.rider_payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Rider sees own payouts" ON public.rider_payouts;
CREATE POLICY "Rider sees own payouts" ON public.rider_payouts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage payouts" ON public.rider_payouts;
CREATE POLICY "Admins manage payouts" ON public.rider_payouts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Link earnings -> payouts now that payouts table exists
ALTER TABLE public.rider_earnings
  DROP CONSTRAINT IF EXISTS rider_earnings_payout_id_fkey;
ALTER TABLE public.rider_earnings
  ADD CONSTRAINT rider_earnings_payout_id_fkey FOREIGN KEY (payout_id) REFERENCES public.rider_payouts(id) ON DELETE SET NULL;

-- Trigger: when an assignment becomes 'delivered', record an earning
CREATE OR REPLACE FUNCTION public.record_rider_earning()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_fee numeric;
BEGIN
  IF NEW.status = 'delivered' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'delivered') THEN
    SELECT COALESCE((value)::numeric, 40) INTO v_fee FROM public.app_settings WHERE key = 'rider_flat_fee';
    INSERT INTO public.rider_earnings(rider_id, order_id, base_fee, total, status, earned_at)
    VALUES (NEW.rider_id, NEW.order_id, COALESCE(v_fee, 40), COALESCE(v_fee, 40), 'pending', now())
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_record_rider_earning ON public.order_assignments;
CREATE TRIGGER trg_record_rider_earning
AFTER INSERT OR UPDATE OF status ON public.order_assignments
FOR EACH ROW EXECUTE FUNCTION public.record_rider_earning();

-- Backfill earnings for already-delivered assignments
INSERT INTO public.rider_earnings(rider_id, order_id, base_fee, total, status, earned_at)
SELECT a.rider_id, a.order_id,
  COALESCE((SELECT (value)::numeric FROM public.app_settings WHERE key='rider_flat_fee'), 40),
  COALESCE((SELECT (value)::numeric FROM public.app_settings WHERE key='rider_flat_fee'), 40),
  'pending', COALESCE(a.delivered_at, a.assigned_at, now())
FROM public.order_assignments a
WHERE a.status = 'delivered'
ON CONFLICT (order_id) DO NOTHING;
