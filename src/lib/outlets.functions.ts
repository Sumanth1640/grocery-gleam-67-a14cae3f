import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const outletInput = z.object({
  id: z.string().uuid().optional(),
  restaurant_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  address: z.string().trim().max(300).default(""),
  area: z.string().trim().max(120).default(""),
  pincode: z.string().trim().max(10).default(""),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  eta_mins: z.number().int().min(5).max(180).default(30),
  is_open: z.boolean().default(true),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

async function ensureOwnsRestaurant(supabase: any, userId: string, restaurantId: string) {
  const { data, error } = await supabase
    .from("partner_restaurants").select("id").eq("id", restaurantId).eq("owner_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    // allow admins too
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Not your restaurant");
  }
}

// Owner: list outlets for any of my restaurants
export const listMyOutlets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: rest, error: e1 } = await supabase
      .from("partner_restaurants").select("id, name").eq("owner_id", userId);
    if (e1) throw new Error(e1.message);
    const ids = (rest ?? []).map((r: any) => r.id);
    if (!ids.length) return { restaurants: [], outlets: [] };
    const { data: outlets, error: e2 } = await supabase
      .from("partner_outlets").select("*").in("restaurant_id", ids).order("sort_order");
    if (e2) throw new Error(e2.message);
    return { restaurants: rest ?? [], outlets: outlets ?? [] };
  });

export const saveOutlet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => outletInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureOwnsRestaurant(context.supabase, context.userId, data.restaurant_id);
    const { data: row, error } = await supabaseAdmin
      .from("partner_outlets").upsert(data as any).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteOutlet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: o, error: e0 } = await supabase
      .from("partner_outlets").select("restaurant_id").eq("id", data.id).maybeSingle();
    if (e0) throw new Error(e0.message);
    if (!o) throw new Error("Outlet not found");
    await ensureOwnsRestaurant(supabase, userId, o.restaurant_id);
    const { error } = await supabaseAdmin.from("partner_outlets").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public: outlets for an approved restaurant
export const listOutletsForRestaurant = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ restaurant_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("partner_outlets")
      .select("id, name, area, pincode, lat, lng, eta_mins, is_open")
      .eq("restaurant_id", data.restaurant_id)
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
