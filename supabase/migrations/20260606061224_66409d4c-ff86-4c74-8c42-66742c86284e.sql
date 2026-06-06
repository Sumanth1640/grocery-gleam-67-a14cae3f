
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_text TEXT NOT NULL DEFAULT 'Delivery in 11 minutes',
  title_line1 TEXT NOT NULL DEFAULT 'Groceries.',
  title_highlight TEXT NOT NULL DEFAULT 'At your door,',
  title_line3 TEXT NOT NULL DEFAULT 'before the kettle whistles.',
  description TEXT NOT NULL DEFAULT '',
  primary_cta_label TEXT NOT NULL DEFAULT 'Shop now',
  primary_cta_link TEXT NOT NULL DEFAULT '/c/fruits',
  secondary_cta_label TEXT NOT NULL DEFAULT 'Browse categories',
  secondary_cta_link TEXT NOT NULL DEFAULT '#categories',
  image TEXT NOT NULL DEFAULT '',
  deal_label TEXT NOT NULL DEFAULT 'Today''s deal',
  deal_text TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.hero_slides TO service_role;

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER hero_slides_set_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
