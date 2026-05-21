CREATE OR REPLACE FUNCTION public.notify_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, kind, title, body, link)
  VALUES (
    NEW.user_id,
    'order',
    'Order placed',
    'Your order of ₹' || NEW.total::text || ' has been placed successfully.',
    '/orders/' || NEW.id::text
  );
  RETURN NEW;
END;
$$;