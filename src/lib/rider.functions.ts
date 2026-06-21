import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

// ---------- Rider self-service ----------

export const riderMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rider } = await supabaseAdmin
      .from("riders").select("*").eq("user_id", userId).maybeSingle();
    return { rider: rider ?? null };
  });

const applyInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/),
  vehicle: z.enum(["bike", "scooter", "bicycle", "car"]).default("bike"),
  vehicle_no: z.string().trim().max(20).default(""),
  notes: z.string().trim().max(500).default(""),
  preferred_outlet_ids: z.array(z.string().uuid()).max(20).default([]),
  preferred_pincodes: z.array(z.string().trim().regex(/^\d{6}$/)).max(40).default([]),
});

export const riderApply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => applyInput.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("riders").select("id, status").eq("user_id", userId).maybeSingle();
    if (existing) throw new Error("You have already applied.");
    const { data: row, error } = await supabaseAdmin
      .from("riders")
      .insert({
        user_id: userId,
        name: data.name,
        phone: data.phone,
        vehicle: data.vehicle,
        vehicle_no: data.vehicle_no,
        notes: data.notes,
        is_active: false,
        status: "pending",
        preferred_outlets: data.preferred_outlet_ids,
        preferred_pincodes: Array.from(new Set(data.preferred_pincodes)),
      } as any)
      .select().single();
    if (error) throw new Error(error.message);
    return row;
  });

// Outlets shown to applicants on the rider signup form (any signed-in user).
export const riderListOutletsForSignup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("partner_outlets")
      .select("id, name, area, pincode, partner_restaurants(name)")
      .eq("is_active", true).order("name");
    return data ?? [];
  });

export const riderMyAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rider } = await supabaseAdmin
      .from("riders").select("id, status").eq("user_id", userId).maybeSingle();
    if (!rider) return [];
    const { data, error } = await supabaseAdmin
      .from("order_assignments")
      .select("id, order_id, status, notes, assigned_at, picked_up_at, delivered_at, updated_at, orders(id, total, status, address, items, payment, created_at)")
      .eq("rider_id", rider.id)
      .order("assigned_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const statusInput = z.object({
  assignment_id: z.string().uuid(),
  status: z.enum(["picked_up", "delivered", "assigned"]),
});

export const riderUpdateAssignmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => statusInput.parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rider } = await supabaseAdmin
      .from("riders").select("id").eq("user_id", userId).maybeSingle();
    if (!rider) throw new Error("Not a rider");
    const { data: a } = await supabaseAdmin
      .from("order_assignments").select("id, order_id, rider_id").eq("id", data.assignment_id).maybeSingle();
    if (!a || a.rider_id !== rider.id) throw new Error("Assignment not found");

    const patch: { status: string; picked_up_at?: string; delivered_at?: string } = { status: data.status };
    if (data.status === "picked_up") patch.picked_up_at = new Date().toISOString();
    if (data.status === "delivered") patch.delivered_at = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("order_assignments").update(patch).eq("id", data.assignment_id);
    if (error) throw new Error(error.message);

    // Mirror to orders.status
    if (data.status === "picked_up") {
      await supabaseAdmin.from("orders").update({ status: "out_for_delivery" }).eq("id", a.order_id);
    } else if (data.status === "delivered") {
      await supabaseAdmin.from("orders").update({ status: "delivered" }).eq("id", a.order_id);
    }
    return { ok: true };
  });

// ---------- Admin: approve/reject riders ----------

export const adminListPendingRiders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("riders").select("*").eq("status", "pending").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const decisionInput = z.object({
  rider_id: z.string().uuid(),
  approve: z.boolean(),
  reason: z.string().trim().max(300).default(""),
});

export const adminDecideRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => decisionInput.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rider } = await supabaseAdmin
      .from("riders").select("id, user_id, preferred_outlets, preferred_pincodes").eq("id", data.rider_id).maybeSingle();
    if (!rider) throw new Error("Rider not found");

    if (data.approve) {
      const { error } = await supabaseAdmin.from("riders")
        .update({ status: "approved", is_active: true, rejection_reason: null })
        .eq("id", data.rider_id);
      if (error) throw new Error(error.message);
      if (rider.user_id) {
        const { error: rErr } = await supabaseAdmin.from("user_roles")
          .insert({ user_id: rider.user_id, role: "rider" as any });
        if (rErr && !String(rErr.message).includes("duplicate")) throw new Error(rErr.message);
        await supabaseAdmin.from("notifications").insert({
          user_id: rider.user_id, kind: "system",
          title: "You're approved 🎉", body: "You can now start accepting deliveries.", link: "/rider",
        });
      }
      // Auto-attach the rider's requested coverage if admin hasn't set any yet.
      const { count: outletLinks } = await supabaseAdmin
        .from("rider_outlets").select("rider_id", { count: "exact", head: true }).eq("rider_id", data.rider_id);
      if (!outletLinks && (rider.preferred_outlets ?? []).length) {
        await supabaseAdmin.from("rider_outlets").insert(
          (rider.preferred_outlets as string[]).map((outlet_id) => ({ rider_id: data.rider_id, outlet_id })),
        );
      }
      const { count: pinLinks } = await supabaseAdmin
        .from("rider_pincodes").select("rider_id", { count: "exact", head: true }).eq("rider_id", data.rider_id);
      if (!pinLinks && (rider.preferred_pincodes ?? []).length) {
        await supabaseAdmin.from("rider_pincodes").insert(
          Array.from(new Set(rider.preferred_pincodes as string[])).map((pincode) => ({ rider_id: data.rider_id, pincode })),
        );
      }
    } else {
      const { error } = await supabaseAdmin.from("riders")
        .update({ status: "rejected", is_active: false, rejection_reason: data.reason })
        .eq("id", data.rider_id);
      if (error) throw new Error(error.message);
      if (rider.user_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: rider.user_id, kind: "system",
          title: "Rider application update",
          body: data.reason || "Your rider application was not approved.",
          link: "/rider",
        });
      }
    }
    return { ok: true };
  });

// ---------- Outlet manager: assignment ----------

// Riders available to assign for a given outlet that the manager owns.
// Optionally ranked by delivery pincode match.
export const outletListAvailableRiders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    outlet_id: z.string().uuid(),
    delivery_pincode: z.string().trim().regex(/^\d{6}$/).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: mine } = await supabase
      .from("partner_outlet_managers").select("outlet_id").eq("user_id", userId).eq("outlet_id", data.outlet_id).maybeSingle();
    if (!mine) throw new Error("Not your outlet");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links } = await supabaseAdmin
      .from("rider_outlets").select("rider_id").eq("outlet_id", data.outlet_id);
    const ids = (links ?? []).map((l) => l.rider_id);
    if (!ids.length) return [];
    const { data: riders } = await supabaseAdmin
      .from("riders").select("id, name, phone, vehicle, vehicle_no, is_active, status").in("id", ids)
      .eq("status", "approved").eq("is_active", true);
    if (!riders?.length) return [];

    // Active load
    const { data: active } = await supabaseAdmin
      .from("order_assignments").select("rider_id, status").in("rider_id", riders.map((r) => r.id))
      .in("status", ["assigned", "picked_up"]);
    const load = new Map<string, number>();
    (active ?? []).forEach((a) => load.set(a.rider_id, (load.get(a.rider_id) ?? 0) + 1));

    // Pincode coverage for ranking
    let pinMatch = new Set<string>();
    if (data.delivery_pincode) {
      const { data: pins } = await supabaseAdmin
        .from("rider_pincodes").select("rider_id").in("rider_id", riders.map((r) => r.id))
        .eq("pincode", data.delivery_pincode);
      pinMatch = new Set((pins ?? []).map((p) => p.rider_id));
    }

    return riders.map((r) => ({
      ...r,
      active_orders: load.get(r.id) ?? 0,
      pincode_match: pinMatch.has(r.id),
    })).sort((a, b) => {
      if (a.pincode_match !== b.pincode_match) return a.pincode_match ? -1 : 1;
      return a.active_orders - b.active_orders;
    });
  });

// Manager assigns or reassigns a rider to one of their outlet's orders.
export const outletAssignOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ order_id: z.string().uuid(), rider_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders").select("id, outlet_id, status").eq("id", data.order_id).maybeSingle();
    if (!order?.outlet_id) throw new Error("Order has no outlet");
    const { data: mine } = await supabase
      .from("partner_outlet_managers").select("outlet_id").eq("user_id", userId).eq("outlet_id", order.outlet_id).maybeSingle();
    if (!mine) throw new Error("Not your outlet");

    // Verify rider is linked to this outlet and active.
    const { data: link } = await supabaseAdmin
      .from("rider_outlets").select("rider_id").eq("outlet_id", order.outlet_id).eq("rider_id", data.rider_id).maybeSingle();
    if (!link) throw new Error("Rider not linked to this outlet");
    const { data: rider } = await supabaseAdmin
      .from("riders").select("status, is_active, user_id").eq("id", data.rider_id).maybeSingle();
    if (!rider || rider.status !== "approved" || !rider.is_active) throw new Error("Rider unavailable");

    const { data: existing } = await supabaseAdmin
      .from("order_assignments").select("id, status").eq("order_id", data.order_id).maybeSingle();
    if (existing) {
      if (existing.status === "delivered") throw new Error("Order already delivered");
      const { error } = await supabaseAdmin.from("order_assignments")
        .update({ rider_id: data.rider_id, status: "assigned", assigned_at: new Date().toISOString(), picked_up_at: null })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("order_assignments")
        .insert({ order_id: data.order_id, rider_id: data.rider_id, status: "assigned" });
      if (error) throw new Error(error.message);
    }
    if (rider.user_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: rider.user_id,
        kind: "order",
        title: "New delivery assigned",
        body: "You have a new delivery. Open the rider app for details.",
        link: "/rider",
      });
      // Trigger FCM push via PHP backend (device tokens live in MySQL).
      try {
        const base = (process.env.PHP_API_BASE || "https://hallifresh.in/php-backend/api").replace(/\/$/, "");
        const secret = process.env.INTERNAL_NOTIFY_SECRET || "";
        if (secret) {
          await fetch(`${base}/internal/notify.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Internal-Secret": secret },
            body: JSON.stringify({
              user_id: rider.user_id,
              kind: "order",
              title: "New delivery assigned",
              body: "You have a new delivery. Open the rider app for details.",
              link: "/rider",
            }),
          });
        }
      } catch (e) { console.error("FCM push trigger failed", e); }
    }
    return { ok: true };
  });

// Read current assignment for an order (for the outlet manager UI).
export const outletGetOrderAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ order_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: a } = await supabaseAdmin
      .from("order_assignments")
      .select("id, status, rider_id, assigned_at, picked_up_at, delivered_at, riders(name, phone, vehicle, vehicle_no)")
      .eq("order_id", data.order_id).maybeSingle();
    return a ?? null;
  });

// ---------- Admin: manage rider <-> outlets/pincodes ----------

export const adminListOutletsForRider = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("partner_outlets").select("id, name, area, pincode, restaurant_id, partner_restaurants(name)")
      .eq("is_active", true).order("name");
    return data ?? [];
  });

export const adminGetRiderAreas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ rider_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: o }, { data: p }] = await Promise.all([
      supabaseAdmin.from("rider_outlets").select("outlet_id").eq("rider_id", data.rider_id),
      supabaseAdmin.from("rider_pincodes").select("pincode").eq("rider_id", data.rider_id),
    ]);
    return {
      outlet_ids: (o ?? []).map((r) => r.outlet_id),
      pincodes: (p ?? []).map((r) => r.pincode),
    };
  });

export const adminSetRiderAreas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    rider_id: z.string().uuid(),
    outlet_ids: z.array(z.string().uuid()).default([]),
    pincodes: z.array(z.string().trim().regex(/^\d{6}$/)).default([]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Replace sets atomically (simple delete + insert).
    await supabaseAdmin.from("rider_outlets").delete().eq("rider_id", data.rider_id);
    await supabaseAdmin.from("rider_pincodes").delete().eq("rider_id", data.rider_id);
    if (data.outlet_ids.length) {
      const { error } = await supabaseAdmin.from("rider_outlets")
        .insert(data.outlet_ids.map((outlet_id) => ({ rider_id: data.rider_id, outlet_id })));
      if (error) throw new Error(error.message);
    }
    if (data.pincodes.length) {
      const { error } = await supabaseAdmin.from("rider_pincodes")
        .insert(Array.from(new Set(data.pincodes)).map((pincode) => ({ rider_id: data.rider_id, pincode })));
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });


// ---------- Customer: see assigned rider for own order ----------
export const customerGetOrderRider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ order_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin
      .from("orders").select("id, user_id").eq("id", data.order_id).maybeSingle();
    if (!order || order.user_id !== userId) return null;
    const { data: a } = await supabaseAdmin
      .from("order_assignments")
      .select("status, assigned_at, picked_up_at, delivered_at, riders(name, phone, vehicle, vehicle_no)")
      .eq("order_id", data.order_id).maybeSingle();
    return a ?? null;
  });
