import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(supabase: { from: (t: string) => { select: (c: string) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => { maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }> } } } } }, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

export const listWarehouseManagers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ warehouse_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("warehouse_managers")
      .select("id, user_id, created_at")
      .eq("warehouse_id", data.warehouse_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (rows ?? []).map((r) => r.user_id);
    if (!ids.length) return [];
    // Fetch profile + email for each
    const { data: profiles } = await supabaseAdmin
      .from("profiles").select("id, full_name").in("id", ids);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    // Fetch auth emails via admin
    const emailMap = new Map<string, string>();
    await Promise.all(
      ids.map(async (uid) => {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
        if (u.user?.email) emailMap.set(uid, u.user.email);
      }),
    );
    return (rows ?? []).map((r) => ({
      id: r.id,
      user_id: r.user_id,
      created_at: r.created_at,
      full_name: profileMap.get(r.user_id)?.full_name ?? null,
      email: emailMap.get(r.user_id) ?? null,
    }));
  });

export const addWarehouseManager = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      warehouse_id: z.string().uuid(),
      email: z.string().trim().email().max(160),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    // Find user by email (paginated list, small scale acceptable)
    let foundId: string | null = null;
    let page = 1;
    while (page <= 10 && !foundId) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const match = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
      if (match) foundId = match.id;
      if (list.users.length < 200) break;
      page++;
    }
    if (!foundId) throw new Error("No user with that email. They must sign up first.");
    const { error } = await supabaseAdmin
      .from("warehouse_managers")
      .insert({ user_id: foundId, warehouse_id: data.warehouse_id });
    if (error) {
      if (error.code === "23505") throw new Error("Already a manager of this warehouse.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const removeWarehouseManager = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("warehouse_managers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Returns the warehouse ids the current user manages (used by admin gating). */
export const myManagedWarehouses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("warehouse_managers")
      .select("warehouse_id, warehouses(id, name, code, city)")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
