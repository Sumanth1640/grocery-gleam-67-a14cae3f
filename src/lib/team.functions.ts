import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(supabase: { from: (t: string) => any }, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Admin role required");
}

async function fetchEmails(ids: string[]): Promise<Map<string, string>> {
  const emails = new Map<string, string>();
  await Promise.all(
    ids.map(async (uid) => {
      const { data } = await supabaseAdmin.auth.admin.getUserById(uid);
      if (data.user?.email) emails.set(uid, data.user.email);
    }),
  );
  return emails;
}

/** Returns every admin + every warehouse manager (one row per assignment). */
export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const [{ data: adminRows, error: aErr }, { data: mgrRows, error: mErr }, { data: whRows }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("id, user_id, created_at").eq("role", "admin"),
      supabaseAdmin.from("warehouse_managers").select("id, user_id, warehouse_id, created_at"),
      supabaseAdmin.from("warehouses").select("id, name, code, city").order("sort_order"),
    ]);
    if (aErr) throw new Error(aErr.message);
    if (mErr) throw new Error(mErr.message);

    const userIds = Array.from(
      new Set([...(adminRows ?? []).map((r) => r.user_id), ...(mgrRows ?? []).map((r) => r.user_id)]),
    );
    const [{ data: profiles }, emails] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("profiles").select("id, full_name, phone").in("id", userIds)
        : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }),
      fetchEmails(userIds),
    ]);
    const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const whMap = new Map((whRows ?? []).map((w) => [w.id, w]));

    const users = userIds.map((uid) => {
      const p = profMap.get(uid);
      const adminRow = (adminRows ?? []).find((r) => r.user_id === uid) ?? null;
      const myMgrRows = (mgrRows ?? []).filter((r) => r.user_id === uid);
      return {
        user_id: uid,
        email: emails.get(uid) ?? null,
        full_name: p?.full_name ?? null,
        phone: p?.phone ?? null,
        admin_assignment_id: adminRow?.id ?? null,
        is_admin: !!adminRow,
        warehouses: myMgrRows.map((m) => ({
          assignment_id: m.id,
          warehouse_id: m.warehouse_id,
          name: whMap.get(m.warehouse_id)?.name ?? "—",
          code: whMap.get(m.warehouse_id)?.code ?? "",
        })),
      };
    });
    // Admins first, then by name/email
    users.sort((a, b) => {
      if (a.is_admin !== b.is_admin) return a.is_admin ? -1 : 1;
      return (a.full_name ?? a.email ?? "").localeCompare(b.full_name ?? b.email ?? "");
    });
    return { users, warehouses: whRows ?? [] };
  });

export const findUserByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ email: z.string().trim().email().max(160) }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    let found: { id: string; email: string } | null = null;
    let page = 1;
    while (page <= 10 && !found) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const m = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
      if (m) found = { id: m.id, email: m.email! };
      if (list.users.length < 200) break;
      page++;
    }
    if (!found) throw new Error("No user with that email. Ask them to sign up first.");
    return found;
  });

export const grantAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.user_id, role: "admin" });
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

export const revokeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot revoke your own admin role.");
    // Refuse to remove the last admin
    const { count } = await supabaseAdmin
      .from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) <= 1) throw new Error("At least one admin must remain.");
    const { error } = await supabaseAdmin
      .from("user_roles").delete().eq("user_id", data.user_id).eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setUserWarehouses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      user_id: z.string().uuid(),
      warehouse_ids: z.array(z.string().uuid()).max(50),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: existing, error: eErr } = await supabaseAdmin
      .from("warehouse_managers").select("id, warehouse_id").eq("user_id", data.user_id);
    if (eErr) throw new Error(eErr.message);
    const have = new Set((existing ?? []).map((r) => r.warehouse_id));
    const want = new Set(data.warehouse_ids);
    const toAdd = data.warehouse_ids.filter((id) => !have.has(id));
    const toRemove = (existing ?? []).filter((r) => !want.has(r.warehouse_id)).map((r) => r.id);
    if (toAdd.length) {
      const { error } = await supabaseAdmin
        .from("warehouse_managers")
        .insert(toAdd.map((wid) => ({ user_id: data.user_id, warehouse_id: wid })));
      if (error) throw new Error(error.message);
    }
    if (toRemove.length) {
      const { error } = await supabaseAdmin
        .from("warehouse_managers").delete().in("id", toRemove);
      if (error) throw new Error(error.message);
    }
    return { ok: true, added: toAdd.length, removed: toRemove.length };
  });
