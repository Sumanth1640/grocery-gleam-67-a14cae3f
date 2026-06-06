import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListHeroSlides, adminSaveHeroSlide, adminDeleteHeroSlide } from "@/lib/admin-extra.functions";
import { USE_PHP } from "@/lib/dual-api";
import { php } from "@/lib/php-api";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/hero-slides")({
  head: () => ({ meta: [{ title: "Hero slides — Admin" }] }),
  component: HeroSlidesPage,
});

type Slide = {
  id?: string;
  badge_text: string;
  title_line1: string;
  title_highlight: string;
  title_line3: string;
  description: string;
  primary_cta_label: string;
  primary_cta_link: string;
  secondary_cta_label: string;
  secondary_cta_link: string;
  image: string;
  deal_label: string;
  deal_text: string;
  is_active: boolean;
  sort_order: number;
};

const empty: Slide = {
  badge_text: "Delivery in 11 minutes",
  title_line1: "Groceries.",
  title_highlight: "At your door,",
  title_line3: "before the kettle whistles.",
  description: "From farm-fresh produce to late-night snacks — order anything, anytime. Hand-picked quality, lightning fast.",
  primary_cta_label: "Shop now",
  primary_cta_link: "/c/fruits",
  secondary_cta_label: "Browse categories",
  secondary_cta_link: "#categories",
  image: "",
  deal_label: "Today's deal",
  deal_text: "Up to 40% off fresh produce",
  is_active: true,
  sort_order: 0,
};

function HeroSlidesPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: () => (USE_PHP ? php.admin.listHeroSlides() : adminListHeroSlides()),
  });
  const [editing, setEditing] = useState<Slide | null>(null);

  const saveM = useMutation({
    mutationFn: (s: Slide) => (USE_PHP ? php.admin.saveHeroSlide(s) : adminSaveHeroSlide({ data: s as any })),
    onSuccess: () => {
      toast.success("Slide saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      qc.invalidateQueries({ queryKey: ["hero-slides"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => (USE_PHP ? php.admin.deleteHeroSlide({ id }) : adminDeleteHeroSlide({ data: { id } })),
    onSuccess: () => {
      toast.success("Slide deleted");
      qc.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      qc.invalidateQueries({ queryKey: ["hero-slides"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Homepage hero slides</h2>
          <p className="text-xs text-muted-foreground">Controls the big hero section at the top of the homepage. Multiple active slides auto-rotate.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop">
          <Plus className="h-3.5 w-3.5" /> New slide
        </button>
      </div>

      <div className="grid gap-3">
        {(q.data ?? []).map((s: any) => (
          <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-14 w-20 overflow-hidden rounded-lg bg-muted bg-cover bg-center" style={s.image ? { backgroundImage: `url(${s.image})` } : undefined} />
              <div className="min-w-0">
                <div className="truncate font-semibold">{s.title_line1} <span className="text-primary">{s.title_highlight}</span> {s.title_line3}</div>
                <div className="truncate text-xs text-muted-foreground">{s.badge_text} · → {s.primary_cta_link}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                {s.is_active ? "Active" : "Hidden"}
              </span>
              <button onClick={() => setEditing(s)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Edit</button>
              <button onClick={() => { if (confirm("Delete this slide?")) delM.mutate(s.id); }} className="rounded-lg border border-destructive/30 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(q.data ?? []).length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No hero slides yet — create one to populate the homepage hero.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setEditing(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} hero slide</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveM.mutate(editing); }} className="mt-4 space-y-3">
              <Field label="Badge text (top pill)"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.badge_text} onChange={(e) => setEditing({ ...editing, badge_text: e.target.value })} /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Title line 1"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" required value={editing.title_line1} onChange={(e) => setEditing({ ...editing, title_line1: e.target.value })} /></Field>
                <Field label="Highlight (coloured)"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.title_highlight} onChange={(e) => setEditing({ ...editing, title_highlight: e.target.value })} /></Field>
                <Field label="Title line 3"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.title_line3} onChange={(e) => setEditing({ ...editing, title_line3: e.target.value })} /></Field>
              </div>
              <Field label="Description"><textarea rows={2} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary CTA label"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.primary_cta_label} onChange={(e) => setEditing({ ...editing, primary_cta_label: e.target.value })} /></Field>
                <Field label="Primary CTA link"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.primary_cta_link} onChange={(e) => setEditing({ ...editing, primary_cta_link: e.target.value })} /></Field>
                <Field label="Secondary CTA label"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.secondary_cta_label} onChange={(e) => setEditing({ ...editing, secondary_cta_label: e.target.value })} /></Field>
                <Field label="Secondary CTA link"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.secondary_cta_link} onChange={(e) => setEditing({ ...editing, secondary_cta_link: e.target.value })} /></Field>
              </div>
              <Field label="Hero image">
                <ImageUpload value={editing.image} folder="banners" onChange={(url) => setEditing({ ...editing, image: url })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Deal label (small)"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.deal_label} onChange={(e) => setEditing({ ...editing, deal_label: e.target.value })} /></Field>
                <Field label="Deal text (bold)"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.deal_text} onChange={(e) => setEditing({ ...editing, deal_text: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
                <Field label="Sort"><input type="number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={saveM.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">
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
  return <label className="block"><div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>{children}</label>;
}
