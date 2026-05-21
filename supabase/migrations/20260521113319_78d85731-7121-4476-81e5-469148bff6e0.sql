-- Wire missing notification triggers and updated_at triggers

-- Customer notification on their own order
DROP TRIGGER IF EXISTS trg_notify_on_order ON public.orders;
CREATE TRIGGER trg_notify_on_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_on_order();

-- Restaurant owner notification on new food order
DROP TRIGGER IF EXISTS trg_notify_restaurant_on_order ON public.orders;
CREATE TRIGGER trg_notify_restaurant_on_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_restaurant_on_order();

-- Warehouse manager notification on new product order
DROP TRIGGER IF EXISTS trg_notify_warehouse_on_order ON public.orders;
CREATE TRIGGER trg_notify_warehouse_on_order
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.notify_warehouse_on_order();

-- Auto-update updated_at on key tables
DROP TRIGGER IF EXISTS trg_categories_updated ON public.categories;
CREATE TRIGGER trg_categories_updated
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_warehouses_updated ON public.warehouses;
CREATE TRIGGER trg_warehouses_updated
BEFORE UPDATE ON public.warehouses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_product_stock_updated ON public.product_stock;
CREATE TRIGGER trg_product_stock_updated
BEFORE UPDATE ON public.product_stock
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_partner_restaurants_updated ON public.partner_restaurants;
CREATE TRIGGER trg_partner_restaurants_updated
BEFORE UPDATE ON public.partner_restaurants
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_partner_dishes_updated ON public.partner_dishes;
CREATE TRIGGER trg_partner_dishes_updated
BEFORE UPDATE ON public.partner_dishes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_partner_outlets_updated ON public.partner_outlets;
CREATE TRIGGER trg_partner_outlets_updated
BEFORE UPDATE ON public.partner_outlets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_reviews_updated ON public.reviews;
CREATE TRIGGER trg_reviews_updated
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row on new user signup
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();