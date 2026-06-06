import { createFileRoute } from "@tanstack/react-router";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/offer-tiles")({
  head: () => ({ meta: [{ title: "Offer tiles — Admin" }] }),
  component: OfferTilesPage,
});

type Tile = {
  id?: string;
  title: string;
  subtitle: string;
  cta_label: string;
  link_to: string;
  tint: string;
  is_active: boolean;
  sort_order: number;
};

const empty: Tile = {
  title: "",
  subtitle: "",
  cta_label: "Shop",
  link_to: "/",
  tint: "oklch(0.93 0.1 95)",
  is_active: true,
  sort_order: 0,
};

const PRESETS = [
  { label: "Peach",  value: "oklch(0.92 0.12 30)" },
  { label: "Yellow", value: "oklch(0.93 0.10 95)" },
  { label: "Green",  value: "oklch(0.93 0.10 145)" },
  { label: "Blue",   value: "oklch(0.92 0.08 240)" },
  { label: "Pink",   value: "oklch(0.92 0.10 350)" },
  { label: "Lilac",  value: "oklch(0.92 0.08 300)" },
];

function OfferTilesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-offer-tiles"], queryFn: () => php.admin.listOfferTiles() });
  const [editing, setEditing] = useState<Tile | null>(null);

  const saveM = useMutation({
    mutationFn: (t: Tile) => php.admin.saveOfferTile(t),
    onSuccess: () => {
      toast.success("Tile saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-offer-tiles"] });
      qc.invalidateQueries({ queryKey: ["offer-tiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => php.admin.deleteOfferTile({ id }),
    onSuccess: () => {
      toast.success("Tile deleted");
      qc.invalidateQueries({ queryKey: ["admin-offer-tiles"] });
      qc.invalidateQueries({ queryKey: ["offer-tiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading)
    return (
      <div className="grid h-40 place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Homepage offer tiles</h2>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop"
        >
          <Plus className="h-3.5 w-3.5" /> New tile
        </button>
      </div>

      <div className="grid gap-3">
        {(q.data ?? []).map((t: any) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-20 rounded-lg" style={{ background: t.tint }} />
              <div className="min-w-0">
                <div className="truncate font-semibold">{t.title}</div>
                <div className="truncate text-xs text-muted-foreground">{t.subtitle} · → {t.link_to}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  t.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {t.is_active ? "Active" : "Hidden"}
              </span>
              <button onClick={() => setEditing(t)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this tile?")) delM.mutate(t.id);
                }}
                className="rounded-lg border border-destructive/30 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(q.data ?? []).length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            No tiles yet — create one to populate the homepage offer strip.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} tile</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveM.mutate(editing);
              }}
              className="mt-4 space-y-3"
            >
              <Field label="Title">
                <input
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>
              <Field label="Subtitle">
                <input
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA label">
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    value={editing.cta_label}
                    onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })}
                  />
                </Field>
                <Field label="Link (e.g. /c/dairy)">
                  <input
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    value={editing.link_to}
                    onChange={(e) => setEditing({ ...editing, link_to: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Tint (CSS color)">
                <input
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono"
                  value={editing.tint}
                  onChange={(e) => setEditing({ ...editing, tint: e.target.value })}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.value}
                      onClick={() => setEditing({ ...editing, tint: p.value })}
                      className="h-7 w-12 rounded-md border"
                      style={{ background: p.value }}
                      title={p.label}
                    />
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort">
                  <input
                    type="number"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </Field>
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div
                className="flex items-center justify-between rounded-2xl border p-5 shadow-card"
                style={{ backgroundColor: editing.tint }}
              >
                <div>
                  <div className="font-display text-lg font-bold">{editing.title || "Preview"}</div>
                  <div className="text-xs text-foreground/70">{editing.subtitle}</div>
                </div>
                <div className="rounded-lg bg-background/70 px-2.5 py-1 text-xs font-bold backdrop-blur">
                  {editing.cta_label || "Shop"} →
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveM.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" /> {saveM.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
