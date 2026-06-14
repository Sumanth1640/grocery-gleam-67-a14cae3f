
-- Rider <-> outlet association
CREATE TABLE public.rider_outlets (
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  outlet_id uuid NOT NULL REFERENCES public.partner_outlets(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (rider_id, outlet_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rider_outlets TO authenticated;
GRANT ALL ON public.rider_outlets TO service_role;
ALTER TABLE public.rider_outlets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage rider_outlets" ON public.rider_outlets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Outlet managers read their outlet riders" ON public.rider_outlets
  FOR SELECT TO authenticated
  USING (public.manages_outlet(auth.uid(), outlet_id));

CREATE POLICY "Riders read their own outlets" ON public.rider_outlets
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid()));

-- Rider <-> pincode association (for warehouse/product orders without an outlet)
CREATE TABLE public.rider_pincodes (
  rider_id uuid NOT NULL REFERENCES public.riders(id) ON DELETE CASCADE,
  pincode text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (rider_id, pincode)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rider_pincodes TO authenticated;
GRANT ALL ON public.rider_pincodes TO service_role;
ALTER TABLE public.rider_pincodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage rider_pincodes" ON public.rider_pincodes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Warehouse managers read rider pincodes" ON public.rider_pincodes
  FOR SELECT TO authenticated
  USING (public.is_warehouse_manager(auth.uid()));

CREATE POLICY "Riders read their own pincodes" ON public.rider_pincodes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.riders r WHERE r.id = rider_id AND r.user_id = auth.uid()));

CREATE INDEX idx_rider_outlets_outlet ON public.rider_outlets(outlet_id);
CREATE INDEX idx_rider_pincodes_pincode ON public.rider_pincodes(pincode);

-- Store rider's preferred outlets/pincodes from signup (admin reviews)
ALTER TABLE public.riders
  ADD COLUMN IF NOT EXISTS preferred_outlets uuid[] DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS preferred_pincodes text[] DEFAULT '{}'::text[];
