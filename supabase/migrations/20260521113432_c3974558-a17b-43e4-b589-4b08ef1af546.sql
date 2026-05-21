-- Drop the duplicate triggers I just added; originals already exist.
DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
DROP TRIGGER IF EXISTS trg_warehouses_updated ON public.warehouses;
DROP TRIGGER IF EXISTS trg_product_stock_updated ON public.product_stock;
DROP TRIGGER IF EXISTS trg_partner_outlets_updated ON public.partner_outlets;
DROP TRIGGER IF EXISTS trg_reviews_updated ON public.reviews;
DROP TRIGGER IF EXISTS trg_notify_on_order ON public.orders; -- duplicate of orders_notify_after_insert
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users; -- duplicate of on_auth_user_created