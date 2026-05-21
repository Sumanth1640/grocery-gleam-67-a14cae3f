
REVOKE EXECUTE ON FUNCTION public.resolve_warehouse_for_pincode(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.resolve_outlet_for_restaurant(uuid, numeric, numeric) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.decrement_warehouse_stock(uuid, jsonb) FROM anon, authenticated, public;
