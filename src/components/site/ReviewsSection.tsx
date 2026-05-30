import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Pencil, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/use-auth";
import { dualApi } from "@/lib/dual-api";

type Props = {
  targetType: "restaurant" | "dish" | "product";
  targetId: string;
  seedRating?: number;
  seedCount?: number;
};

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  author_name?: string;
  user_email?: string;
};

export function ReviewsSection({ targetType, targetId, seedRating, seedCount }: Props) {
  const { user, loading } = useAuth();
  const qc = useQueryClient();

  const key = ["reviews", targetType, targetId];
  const allQ = useQuery({
    queryKey: key,
    queryFn: () => dualApi.listReviews(targetType, targetId),
  });

  const reviews: ReviewRow[] = (allQ.data?.reviews as ReviewRow[]) ?? [];
  const sum = { count: allQ.data?.count ?? 0, avg: allQ.data?.avg ?? 0 };
  const mine = user ? reviews.find((r) => r.user_id === user.id) ?? null : null;

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setTitle(mine.title ?? "");
      setBody(mine.body ?? "");
    }
  }, [mine?.id]);

  const save = useMutation({
    mutationFn: () =>
      dualApi.addReview({
        target_type: targetType,
        target_id: targetId,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Review saved");
      setEditing(false);
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: () => dualApi.deleteReview(targetType, targetId),
    onSuccess: () => {
      toast.success("Review removed");
      setRating(5); setTitle(""); setBody(""); setEditing(false);
      qc.invalidateQueries({ queryKey: key });
    },
  });

  const avg = sum.count > 0 ? sum.avg : seedRating ?? 0;
  const totalShown = sum.count > 0 ? sum.count : seedCount ?? 0;

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-card md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Ratings & reviews</h2>
          <div className="mt-1 inline-flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-md bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">
              <Star className="h-3 w-3 fill-current" /> {avg ? avg.toFixed(1) : "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalShown.toLocaleString()} rating{totalShown === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        {!loading && !user && (
          <Link to="/login" search={{ redirect: window.location.pathname }} className="rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-pop">
            Sign in to review
          </Link>
        )}
      </div>

      {user && (
        <div className="mt-4 rounded-xl border bg-secondary/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {mine ? "Your review" : "Leave a review"}
            </div>
            {mine && !editing && (
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => del.mutate()} className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          {mine && !editing ? (
            <div className="mt-2">
              <StarRow value={mine.rating} />
              {mine.title && <div className="mt-1 text-sm font-bold">{mine.title}</div>}
              {mine.body && <p className="mt-1 text-xs text-muted-foreground">{mine.body}</p>}
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
              className="mt-2 space-y-2"
            >
              <StarPicker value={rating} onChange={setRating} />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                maxLength={120}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share details (optional)"
                maxLength={1000}
                rows={3}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
              />
              <div className="flex gap-2">
                <button disabled={save.isPending} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">
                  {save.isPending ? "Saving…" : mine ? "Update" : "Post review"}
                </button>
                {editing && (
                  <button type="button" onClick={() => setEditing(false)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      <div className="mt-5">
        {allQ.isLoading ? (
          <div className="grid h-24 place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <MessageSquare className="mx-auto mb-2 h-5 w-5" />
            No reviews yet. Be the first to share!
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {reviews.map((rv) => {
              const name = rv.author_name ?? rv.user_email?.split("@")[0] ?? "User";
              return (
                <li key={rv.id} className="rounded-xl border bg-background p-4">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold">{name}</div>
                      <StarRow value={rv.rating} />
                    </div>
                    <div className="ml-auto text-[10px] text-muted-foreground">
                      {new Date(rv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {rv.title && <div className="mt-2 text-sm font-bold">{rv.title}</div>}
                  {rv.body && <p className="mt-1 text-xs text-muted-foreground">{rv.body}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="inline-flex items-center text-success">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < value ? "fill-current" : "opacity-25"}`} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="rounded p-0.5 text-success hover:scale-110 transition"
          >
            <Star className={`h-5 w-5 ${n <= value ? "fill-current" : "opacity-30"}`} />
          </button>
        );
      })}
      <span className="ml-2 text-xs text-muted-foreground">{value}/5</span>
    </div>
  );
}
