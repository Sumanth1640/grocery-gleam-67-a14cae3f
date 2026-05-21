import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const targetSchema = z.object({
  target_type: z.enum(["restaurant", "dish", "product"]),
  target_id: z.string().trim().min(1).max(120),
});

export const listReviews = createServerFn({ method: "GET" })
  .inputValidator((input) => targetSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("reviews")
      .select("id, user_id, rating, title, body, created_at")
      .eq("target_type", data.target_type)
      .eq("target_id", data.target_id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let nameMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .in("id", ids);
      nameMap = Object.fromEntries((profs ?? []).map((p) => [p.id, p.full_name ?? ""]));
    }
    return (rows ?? []).map((r) => ({
      ...r,
      author_name: nameMap[r.user_id] || "Anonymous",
    }));
  });

export const reviewSummary = createServerFn({ method: "GET" })
  .inputValidator((input) => targetSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("target_type", data.target_type)
      .eq("target_id", data.target_id);
    if (error) throw new Error(error.message);
    const count = rows?.length ?? 0;
    const avg = count > 0 ? rows!.reduce((s, r) => s + r.rating, 0) / count : 0;
    return { count, avg: Math.round(avg * 10) / 10 };
  });

export const myReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => targetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("target_type", data.target_type)
      .eq("target_id", data.target_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const upsertReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    targetSchema.extend({
      rating: z.number().int().min(1).max(5),
      title: z.string().trim().max(120).optional().nullable(),
      body: z.string().trim().max(1000).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("reviews").upsert(
      {
        user_id: userId,
        target_type: data.target_type,
        target_id: data.target_id,
        rating: data.rating,
        title: data.title || null,
        body: data.body || null,
      },
      { onConflict: "user_id,target_type,target_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => targetSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("user_id", userId)
      .eq("target_type", data.target_type)
      .eq("target_id", data.target_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
