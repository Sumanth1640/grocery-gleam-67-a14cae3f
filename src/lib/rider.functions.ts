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
      })
      .select().single();
    if (error) throw new Error(error.message);
    return row;
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
      .from("riders").select("id, user_id").eq("id", data.rider_id).maybeSingle();
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
