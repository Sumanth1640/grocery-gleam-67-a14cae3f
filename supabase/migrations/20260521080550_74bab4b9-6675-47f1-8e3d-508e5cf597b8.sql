REVOKE EXECUTE ON FUNCTION public.owns_restaurant(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.owns_restaurant(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.owns_restaurant(uuid, uuid) TO authenticated;