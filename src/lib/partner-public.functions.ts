import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listApprovedRestaurants = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("partner_restaurants")
      .select("*")
      .eq("status", "approved")
      .not("agreement_accepted_at", "is", null)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getApprovedRestaurant = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { data: r, error } = await supabaseAdmin
      .from("partner_restaurants")
      .select("*, partner_dishes(*, partner_dish_variants(*), partner_dish_addons(*))")
      .eq("status", "approved")
      .not("agreement_accepted_at", "is", null)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return r;
  });

export const listAllApprovedDishes = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: restaurants, error: rErr } = await supabaseAdmin
      .from("partner_restaurants")
      .select("id, slug, name, image, cover, area, rating, eta_mins, distance_km, cost_for_two, price_tier, veg, cuisines, reviews_count, offer")
      .eq("status", "approved")
      .not("agreement_accepted_at", "is", null)
      .eq("is_blocked", false);
    if (rErr) throw new Error(rErr.message);
    const rList = restaurants ?? [];
    if (rList.length === 0) return [];
    const ids = rList.map((r) => r.id);
    const { data: dishes, error: dErr } = await supabaseAdmin
      .from("partner_dishes")
      .select("*, partner_dish_variants(*), partner_dish_addons(*)")
      .in("restaurant_id", ids)
      .eq("in_stock", true);
    if (dErr) throw new Error(dErr.message);
    const rMap = new Map(rList.map((r) => [r.id, r]));
    return (dishes ?? []).map((d: any) => ({ ...d, restaurant: rMap.get(d.restaurant_id) }));
  });
