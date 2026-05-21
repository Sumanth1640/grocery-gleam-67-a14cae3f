-- Revoke direct execute on internal trigger / helper functions.
-- These must keep SECURITY DEFINER to function as triggers / RLS helpers,
-- but should never be callable directly by anon or authenticated users.

REVOKE EXECUTE ON FUNCTION public.notify_on_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_restaurant_on_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_warehouse_on_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_warehouse_stock(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_warehouse_for_pincode(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.resolve_outlet_for_restaurant(uuid, numeric, numeric) FROM PUBLIC, anon, authenticated;