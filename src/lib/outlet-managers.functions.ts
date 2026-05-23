import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ORDER_STATUSES = ["placed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;

async function ensureOwnsRestaurant(userId: string, restaurantId: string) {
  const { data, error } = await supabaseAdmin
    .from("partner_restaurants")
    .select("id, owner_id")
    .eq("id", restaurantId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Restaurant not found");
  if (data.owner_id !== userId) {
    const { data: role } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Not your restaurant");
  }
}

// ---------- Owner-side ----------

export const listOutletManagers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ restaurant_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureOwnsRestaurant(context.userId, data.restaurant_id);

    const { data: outlets, error: oe } = await supabaseAdmin
      .from("partner_outlets")
      .select("id, name, area, pincode")
      .eq("restaurant_id", data.restaurant_id)
      .order("sort_order");
    if (oe) throw new Error(oe.message);

    const { data: rows, error } = await supabaseAdmin
      .from("partner_outlet_managers")
      .select("id, outlet_id, user_id, role, created_at")
      .eq("restaurant_id", data.restaurant_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    const profiles = new Map<string, { full_name: string | null }>();
    if (userIds.length) {
      const { data: p } = await supabaseAdmin.from("profiles").select("id, full_name").in("id", userIds);
      (p ?? []).forEach((r) => profiles.set(r.id, { full_name: r.full_name }));
    }
    const emails = new Map<string, string>();
    await Promise.all(
      userIds.map(async (uid) => {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (u.user?.email) emails.set(uid, u.user.email);
      }),
    );

    return {
      outlets: outlets ?? [],
      managers: (rows ?? []).map((r) => ({
        ...r,
        full_name: profiles.get(r.user_id)?.full_name ?? null,
        email: emails.get(r.user_id) ?? null,
      })),
    };
  });

export const addOutletManager = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      outlet_id: z.string().uuid(),
      email: z.string().trim().email().max(160),
      role: z.enum(["manager", "cashier"]).default("manager"),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Look up outlet → restaurant
    const { data: outlet, error: oe } = await supabaseAdmin
      .from("partner_outlets").select("id, restaurant_id").eq("id", data.outlet_id).maybeSingle();
    if (oe) throw new Error(oe.message);
    if (!outlet) throw new Error("Outlet not found");
    await ensureOwnsRestaurant(context.userId, outlet.restaurant_id);

    // Find user by email (paginated)
    let foundId: string | null = null;
    let page = 1;
    while (page <= 10 && !foundId) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const m = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
      if (m) foundId = m.id;
      if (list.users.length < 200) break;
      page++;
    }
    if (!foundId) throw new Error("No user with that email. They must sign up first.");

    const { error } = await supabaseAdmin.from("partner_outlet_managers").insert({
      outlet_id: data.outlet_id,
      restaurant_id: outlet.restaurant_id,
      user_id: foundId,
      role: data.role,
    });
    if (error) {
      if (error.code === "23505") throw new Error("Already a manager of this outlet.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const removeOutletManager = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error: re } = await supabaseAdmin
      .from("partner_outlet_managers").select("restaurant_id").eq("id", data.id).maybeSingle();
    if (re) throw new Error(re.message);
    if (!row) throw new Error("Not found");
    await ensureOwnsRestaurant(context.userId, row.restaurant_id);
    const { error } = await supabaseAdmin.from("partner_outlet_managers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Manager-side ----------

export const myManagedOutlets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("partner_outlet_managers")
      .select("id, outlet_id, restaurant_id, role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    if (!rows.length) return [];
    const outletIds = rows.map((r) => r.outlet_id);
    const restIds = Array.from(new Set(rows.map((r) => r.restaurant_id)));
    const [{ data: outlets }, { data: rests }] = await Promise.all([
      supabaseAdmin.from("partner_outlets").select("id, name, area, pincode, is_open").in("id", outletIds),
      supabaseAdmin.from("partner_restaurants").select("id, name").in("id", restIds),
    ]);
    const rMap = new Map((rests ?? []).map((r) => [r.id, r.name]));
    const oMap = new Map((outlets ?? []).map((o) => [o.id, o]));
    return rows.map((r) => ({
      ...r,
      outlet: oMap.get(r.outlet_id) ?? null,
      restaurant_name: rMap.get(r.restaurant_id) ?? null,
    }));
  });

export const listOutletOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ outlet_id: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: mine, error: me } = await supabase
      .from("partner_outlet_managers").select("outlet_id").eq("user_id", userId);
    if (me) throw new Error(me.message);
    let outletIds = (mine ?? []).map((m) => m.outlet_id);
    if (data.outlet_id) {
      if (!outletIds.includes(data.outlet_id)) throw new Error("Not your outlet");
      outletIds = [data.outlet_id];
    }
    if (!outletIds.length) return [];
    const { data: orders, error } = await supabase
      .from("orders").select("*").in("outlet_id", outletIds)
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return orders ?? [];
  });

export const updateOutletOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: z.enum(ORDER_STATUSES) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    const { data: order } = await supabase.from("orders").select("user_id, id").eq("id", data.id).single();
    if (order) {
      await supabase.from("notifications").insert({
        user_id: order.user_id,
        kind: "order",
        title: `Order ${data.status.replace("_", " ")}`,
        body: `Your order status was updated to "${data.status.replace("_", " ")}".`,
        link: `/orders/${order.id}`,
      } as never);
    }
    return { ok: true };
  });

export const listOutletDishes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ outlet_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: mine } = await supabase
      .from("partner_outlet_managers").select("outlet_id").eq("user_id", userId).eq("outlet_id", data.outlet_id).maybeSingle();
    if (!mine) throw new Error("Not your outlet");
    const { data: dishes, error } = await supabaseAdmin
      .from("partner_dishes")
      .select("id, name, section, price, image, in_stock, outlet_id")
      .eq("outlet_id", data.outlet_id)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return dishes ?? [];
  });

export const toggleOutletDishStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), in_stock: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("partner_dishes").update({ in_stock: data.in_stock }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
