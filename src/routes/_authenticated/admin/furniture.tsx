import { createFileRoute } from "@tanstack/react-router";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/furniture")({
  head: () => ({ meta: [{ title: "Furniture — Admin" }] }),
  component: AdminFurniturePage,
});

type Item = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  wood: string;
  price: number;
  mrp: number;
  image: string;
  blurb: string;
  dimensions: string;
  is_active: boolean;
  sort_order: number;
};

const empty: Item = {
  slug: "", name: "", category: "living", wood: "Sheesham",
  price: 0, mrp: 0, image: "", blurb: "", dimensions: "",
  is_active: true, sort_order: 0,
};

const CATEGORIES = ["living", "bedroom", "dining", "study", "storage"];
const WOODS = ["Sheesham", "Teak", "Mango", "Oak", "Walnut"];

function AdminFurniturePage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-furniture"], queryFn: () => php.admin.listFurniture() });
  const [editing, setEditing] = useState<Item | null>(null);

  const saveM = useMutation({
    mutationFn: (i: Item) => php.admin.saveFurniture(i),
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-furniture"] });
      qc.invalidateQueries({ queryKey: ["furniture"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => php.admin.deleteFurniture({ id }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-furniture"] });
      qc.invalidateQueries({ queryKey: ["furniture"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading)
    return <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Furniture catalog</h2>
        <button
          onClick={() => setEditing({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop"
        >
          <Plus className="h-3.5 w-3.5" /> New piece
        </button>
      </div>

      <div className="grid gap-3">
        {(q.data ?? []).map((it: any) => (
          <div key={it.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-card">
            <div className="flex min-w-0 items-center gap-3">
              <img src={it.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{it.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {it.category} · {it.wood} · ₹{Number(it.price).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                it.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}>
                {it.is_active ? "Active" : "Hidden"}
              </span>
              <button onClick={() => setEditing(it)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
                Edit
              </button>
              <button
                onClick={() => { if (confirm("Delete this piece?")) delM.mutate(it.id); }}
                className="rounded-lg border border-destructive/30 px-2 py-1.5 text-xs text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {(q.data ?? []).length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            No furniture yet — create one to populate the /furniture page.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 overflow-y-auto" onClick={() => setEditing(null)}>
          <div className="my-auto w-full max-w-2xl rounded-2xl border bg-card p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">{editing.id ? "Edit" : "New"} piece</h3>
            <form onSubmit={(e) => { e.preventDefault(); saveM.mutate(editing); }} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name *"><Inp value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} required /></Field>
                <Field label="Slug *"><Inp value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} required /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Select value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} options={CATEGORIES} />
                </Field>
                <Field label="Wood">
                  <Select value={editing.wood} onChange={(v) => setEditing({ ...editing, wood: v })} options={WOODS} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price (₹)"><Inp type="number" value={String(editing.price)} onChange={(v) => setEditing({ ...editing, price: Number(v) })} /></Field>
                <Field label="MRP (₹)"><Inp type="number" value={String(editing.mrp)} onChange={(v) => setEditing({ ...editing, mrp: Number(v) })} /></Field>
              </div>
              <Field label="Image URL"><Inp value={editing.image} onChange={(v) => setEditing({ ...editing, image: v })} /></Field>
              <Field label="Dimensions"><Inp value={editing.dimensions} onChange={(v) => setEditing({ ...editing, dimensions: v })} /></Field>
              <Field label="Blurb">
                <textarea rows={2} className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={editing.blurb} onChange={(e) => setEditing({ ...editing, blurb: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Sort"><Inp type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) })} /></Field>
                <label className="flex items-end gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={saveM.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">
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
function Inp(p: { value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return <input type={p.type ?? "text"} required={p.required} className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
    value={p.value} onChange={(e) => p.onChange(e.target.value)} />;
}
function Select(p: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={p.value} onChange={(e) => p.onChange(e.target.value)}>
      {p.options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
