import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Returns the best warehouse for a pincode, or null if not serviceable. */
export const resolveWarehouseForPincode = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ pincode: z.string().regex(/^\d{4,8}$/) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin.rpc("resolve_warehouse_for_pincode", { _pincode: data.pincode });
    if (error) throw new Error(error.message);
    const warehouseId = row as unknown as string | null;
    if (!warehouseId) return { serviceable: false as const, warehouse: null };
    const { data: wh } = await supabaseAdmin
      .from("warehouses").select("id, name, code, city, pincode").eq("id", warehouseId).maybeSingle();
    return { serviceable: true as const, warehouse: wh };
  });

/** Returns the nearest outlet for a restaurant given optional customer lat/lng. */
export const resolveOutletForRestaurant = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    restaurant_id: z.string().uuid(),
    lat: z.number().min(-90).max(90).nullable().optional(),
    lng: z.number().min(-180).max(180).nullable().optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin.rpc("resolve_outlet_for_restaurant", {
      _restaurant_id: data.restaurant_id,
      _lat: data.lat ?? null,
      _lng: data.lng ?? null,
    });
    if (error) throw new Error(error.message);
    const outletId = row as unknown as string | null;
    if (!outletId) return { outlet: null };
    const { data: out } = await supabaseAdmin
      .from("partner_outlets").select("id, name, area, pincode, eta_mins").eq("id", outletId).maybeSingle();
    return { outlet: out };
  });
