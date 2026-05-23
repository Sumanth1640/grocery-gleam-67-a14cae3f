import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListBanners, adminSaveBanner, adminDeleteBanner } from "@/lib/admin-extra.functions";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({ meta: [{ title: "Banners — Admin" }] }),
  component: BannersPage,
});

type Banner = {
  id?: string;
  title: string;
  subtitle: string;
  cta_label: string;
  link_to: string;
  bg: string;
  fg: string;
  image: string;
  is_active: boolean;
  sort_order: number;
};

const empty: Banner = {
  title: "", subtitle: "", cta_label: "Shop now", link_to: "/",
  bg: "linear-gradient(135deg, oklch(0.92 0.13 80), oklch(0.88 0.16 50))",
  fg: "oklch(0.25 0.05 40)", image: "", is_active: true, sort_order: 0,
};

function BannersPage() {
  const listFn = useServerFn(adminListBanners);
  const saveFn = useServerFn(adminSaveBanner);
  const delFn = useServerFn(adminDeleteBanner);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-banners"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<Banner | null>(null);

  const saveM = useMutation({
    mutationFn: (b: Banner) => saveFn({ data: b as any }),
    onSuccess: () => { toast.success("Banner saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-banners"] }); qc.invalidateQueries({ queryKey: ["banners"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Banner deleted"); qc.invalidateQueries({ queryKey: ["admin-banners"] }); qc.invalidateQueries({ queryKey: ["banners"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Homepage banners</h2>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop">
          <Plus className="h-3.5 w-3.5" /> New banner
        </button>
      </div>

      <div className="grid gap-3">
        {(q.data ?? []).map((b: any) => (
          <div key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-card">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-20 rounded-lg" style={{ background: b.bg }} />
              <div className="min-w-0">
                <div className="truncate font-semibold">{b.title}</div>
                <div className="truncate text-xs text-muted-foreground">{b.subtitle} · → {b.link_to}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${b.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                {b.is_active ? "Active" : "Hidden"}
              </span>
              <button onClick={() => setEditing(b)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Edit</button>
              <button onClick={() => { if (confirm("Delete this banner?")) delM.mutate(b.id); }} className="rounded-lg border border-destructive/30 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/5">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(q.data ?? []).length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No banners yet — create one to populate the homepage carousel.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} banner</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveM.mutate(editing); }} className="mt-4 space-y-3">
              <Field label="Title"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="Subtitle"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="CTA label"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.cta_label} onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })} /></Field>
                <Field label="Link (e.g. /c/fruits)"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.link_to} onChange={(e) => setEditing({ ...editing, link_to: e.target.value })} /></Field>
              </div>
              <Field label="Background (CSS)"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" value={editing.bg} onChange={(e) => setEditing({ ...editing, bg: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Foreground color"><input className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono" value={editing.fg} onChange={(e) => setEditing({ ...editing, fg: e.target.value })} /></Field>
                <Field label="Sort"><input type="number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
              <div className="rounded-xl p-4" style={{ background: editing.bg, color: editing.fg }}>
                <div className="font-display text-base font-extrabold">{editing.title || "Preview"}</div>
                <div className="text-xs opacity-80">{editing.subtitle}</div>
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
