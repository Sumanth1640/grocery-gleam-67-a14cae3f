
ALTER TABLE public.partner_dishes
  ADD COLUMN IF NOT EXISTS available_days smallint[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}'::smallint[],
  ADD COLUMN IF NOT EXISTS available_from text NOT NULL DEFAULT '00:00',
  ADD COLUMN IF NOT EXISTS available_to text NOT NULL DEFAULT '23:59';
