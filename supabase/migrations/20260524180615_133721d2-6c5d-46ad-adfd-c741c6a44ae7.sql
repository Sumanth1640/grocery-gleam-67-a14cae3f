
-- partner_restaurants: drop broad public read; server functions use service role
DROP POLICY IF EXISTS partner_restaurants_public_read_approved ON public.partner_restaurants;

-- coupons: drop public read; client moves to a server function with safe columns only
DROP POLICY IF EXISTS coupons_public_read ON public.coupons;

-- reviews: drop public read; reviews are served via server function (supabaseAdmin)
DROP POLICY IF EXISTS reviews_public_read ON public.reviews;

-- riders: restrict to admins only (was readable by every authenticated user)
DROP POLICY IF EXISTS riders_partner_read ON public.riders;

-- Lock down SECURITY DEFINER functions: revoke from anon/public; keep authenticated only where needed
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.owns_restaurant(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.manages_warehouse(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_warehouse_manager(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.manages_outlet(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_outlet_manager(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.resolve_warehouse_for_pincode(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.resolve_outlet_for_restaurant(uuid, numeric, numeric) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.decrement_warehouse_stock(uuid, jsonb) FROM anon, public, authenticated;

-- Trigger-only functions should not be callable directly by clients
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_order() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_warehouse_on_order() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_restaurant_on_order() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_outlet_managers_on_order() FROM anon, public, authenticated;
REVOKE EXECUTE ON FUNCTION public.block_orders_for_blocked_users() FROM anon, public, authenticated;
