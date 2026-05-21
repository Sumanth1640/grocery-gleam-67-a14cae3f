CREATE OR REPLACE FUNCTION public.notify_restaurant_on_order()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_owner uuid;
  v_name text;
  v_outlet text;
BEGIN
  IF NEW.restaurant_id IS NULL THEN RETURN NEW; END IF;
  SELECT owner_id, name INTO v_owner, v_name FROM public.partner_restaurants WHERE id = NEW.restaurant_id;
  IF v_owner IS NULL THEN RETURN NEW; END IF;
  IF NEW.outlet_id IS NOT NULL THEN
    SELECT name INTO v_outlet FROM public.partner_outlets WHERE id = NEW.outlet_id;
  END IF;
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (
    v_owner, 'order',
    'New order received',
    'A customer ordered ₹' || NEW.total::text || ' from ' || COALESCE(v_name, 'your restaurant') ||
      CASE WHEN v_outlet IS NOT NULL THEN ' (' || v_outlet || ')' ELSE '' END || '.',
    '/partner/orders'
  );
  RETURN NEW;
END;
$function$;