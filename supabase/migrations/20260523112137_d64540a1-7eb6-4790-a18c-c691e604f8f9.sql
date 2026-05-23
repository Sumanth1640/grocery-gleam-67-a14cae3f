ALTER TABLE public.partner_restaurants
  ADD COLUMN IF NOT EXISTS is_blocked boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS partner_restaurants_public_read_approved ON public.partner_restaurants;
CREATE POLICY partner_restaurants_public_read_approved
ON public.partner_restaurants
FOR SELECT
TO anon, authenticated
USING ((status = 'approved'::text) AND (agreement_accepted_at IS NOT NULL) AND (is_blocked = false));
