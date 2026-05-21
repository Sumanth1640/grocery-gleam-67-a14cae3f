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
