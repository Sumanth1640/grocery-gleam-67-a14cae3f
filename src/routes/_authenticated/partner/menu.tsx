import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyDishes, createDish, updateDish, deleteDish, toggleDishStock, bulkImportDishes } from "@/lib/partner.functions";
import { listMyOutlets } from "@/lib/outlets.functions";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, X, Upload, Download } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/partner/menu")({
  component: MenuPage,
});

const CSV_HEADERS = ["name", "description", "image", "price", "mrp", "veg", "spicy", "bestseller", "section", "in_stock"] as const;
const CSV_TEMPLATE = CSV_HEADERS.join(",") + "\nMargherita Pizza,Classic cheese,,249,299,true,false,true,Pizza,true\nVeg Burger,House special,,149,,true,false,false,Burgers,true\n";

function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r\n?/g, "\n").trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const parseLine = (l: string) => {
    const out: string[] = []; let cur = ""; let q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) { if (c === '"' && l[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else { if (c === '"') q = true; else if (c === ",") { out.push(cur); cur = ""; } else cur += c; }
    }
    out.push(cur);
    return out;
  };
  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = (cells[i] ?? "").trim()));
    return obj;
  });
}

function toBool(s: string, def = false) {
  if (!s) return def;
  return ["true", "1", "yes", "y"].includes(s.toLowerCase());
}

type DishForm = {
  name: string; description: string; image: string; price: number; mrp: number | null;
  veg: boolean; spicy: boolean; bestseller: boolean; section: string; in_stock: boolean; sort_order: number;
  outlet_id: string | null;
  available_days: number[]; available_from: string; available_to: string;
};
const emptyDish: DishForm = { name: "", description: "", image: "", price: 0, mrp: null, veg: true, spicy: false, bestseller: false, section: "Mains", in_stock: true, sort_order: 0, outlet_id: null, available_days: [0,1,2,3,4,5,6], available_from: "00:00", available_to: "23:59" };
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;

function MenuPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyDishes);
  const outletsFn = useServerFn(listMyOutlets);
  const createFn = useServerFn(createDish);
  const updateFn = useServerFn(updateDish);
  const delFn = useServerFn(deleteDish);
  const stockFn = useServerFn(toggleDishStock);
  const q = useQuery({ queryKey: ["my-dishes"], queryFn: () => listFn() });
  const outletsQ = useQuery({ queryKey: ["partner", "outlets"], queryFn: () => outletsFn() });
  const outlets = (outletsQ.data?.outlets ?? []) as Array<{ id: string; name: string; restaurant_id: string }>;
  const [editing, setEditing] = useState<{ id?: string; form: DishForm } | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const payload = { ...editing.form, mrp: editing.form.mrp || null };
      if (editing.id) await updateFn({ data: { id: editing.id, dish: payload } });
      else await createFn({ data: { dish: payload, variants: [], addons: [] } });
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["my-dishes"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["my-dishes"] }); },
  });
  const toggle = useMutation({
    mutationFn: ({ id, in_stock }: { id: string; in_stock: boolean }) => stockFn({ data: { id, in_stock } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-dishes"] }),
  });

  const bulkFn = useServerFn(bulkImportDishes);
  const fileRef = useRef<HTMLInputElement>(null);
  const bulk = useMutation({
    mutationFn: (dishes: any[]) => bulkFn({ data: { dishes } }),
    onSuccess: (r) => { toast.success(`Imported ${r.inserted} dishes`); qc.invalidateQueries({ queryKey: ["my-dishes"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const onCsvFile = async (file: File) => {
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) return toast.error("CSV is empty or missing rows");
    const dishes = rows.map((r) => ({
      name: r.name,
      description: r.description ?? "",
      image: r.image ?? "",
      price: Number(r.price || 0),
      mrp: r.mrp ? Number(r.mrp) : null,
      veg: toBool(r.veg, true),
      spicy: toBool(r.spicy, false),
      bestseller: toBool(r.bestseller, false),
      section: r.section || "Mains",
      in_stock: toBool(r.in_stock, true),
    })).filter((d) => d.name && d.price >= 0);
    if (dishes.length === 0) return toast.error("No valid rows found (need name + price)");
    bulk.mutate(dishes);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "menu-template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-bold">Menu</h1>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onCsvFile(f); e.target.value = ""; }} />
          <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary"><Download className="h-3.5 w-3.5" /> Template</button>
          <button disabled={bulk.isPending} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-bold hover:bg-secondary disabled:opacity-60"><Upload className="h-3.5 w-3.5" /> {bulk.isPending ? "Importing…" : "Import CSV"}</button>
          <button onClick={() => setEditing({ form: emptyDish })} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop"><Plus className="h-4 w-4" /> Add dish</button>
        </div>
      </div>
      {q.isLoading ? <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
        <ul className="mt-6 grid gap-3">
          {(q.data ?? []).length === 0 && <li className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">No dishes yet. Add your first one.</li>}
          {(q.data ?? []).map((d) => (
            <li key={d.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-card">
              {d.image && <img src={d.image} alt="" className="h-14 w-14 rounded-xl object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><div className="text-sm font-bold">{d.name}</div><span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase">{d.section}</span></div>
                <div className="text-xs text-muted-foreground">₹{d.price}{d.mrp ? ` · MRP ₹${d.mrp}` : ""}</div>
              </div>
              <label className="inline-flex items-center gap-1 text-xs font-semibold"><input type="checkbox" checked={d.in_stock} onChange={(e) => toggle.mutate({ id: d.id, in_stock: e.target.checked })} /> In stock</label>
              <button onClick={() => setEditing({ id: d.id, form: { name: d.name, description: d.description ?? "", image: d.image ?? "", price: d.price, mrp: d.mrp, veg: d.veg, spicy: d.spicy, bestseller: d.bestseller, section: d.section, in_stock: d.in_stock, sort_order: d.sort_order, outlet_id: (d as any).outlet_id ?? null, available_days: ((d as any).available_days ?? [0,1,2,3,4,5,6]) as number[], available_from: (d as any).available_from ?? "00:00", available_to: (d as any).available_to ?? "23:59" } })} className="rounded-lg border p-2 hover:bg-secondary" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => { if (confirm("Delete this dish?")) del.mutate(d.id); }} className="rounded-lg border p-2 text-destructive hover:bg-destructive/10" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-pop">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing.id ? "Edit dish" : "Add dish"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3">
              <input required placeholder="Dish name" value={editing.form.name} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, name: e.target.value } })} className="rounded-xl border bg-background px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={editing.form.description} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, description: e.target.value } })} className="rounded-xl border bg-background px-3 py-2 text-sm" rows={2} />
              <ImageUpload value={editing.form.image} onChange={(url) => setEditing({ ...editing, form: { ...editing.form, image: url } })} folder="dishes" />
              <div className="grid grid-cols-3 gap-2">
                <input required type="number" placeholder="Price" value={editing.form.price} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, price: Number(e.target.value) } })} className="rounded-xl border bg-background px-3 py-2 text-sm" />
                <input type="number" placeholder="MRP" value={editing.form.mrp ?? ""} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, mrp: e.target.value ? Number(e.target.value) : null } })} className="rounded-xl border bg-background px-3 py-2 text-sm" />
                <input placeholder="Section" value={editing.form.section} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, section: e.target.value } })} className="rounded-xl border bg-background px-3 py-2 text-sm" />
              </div>
              {outlets.length > 0 && (
                <label className="block">
                  <div className="mb-1 text-xs font-semibold text-muted-foreground">Available at outlet</div>
                  <select
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                    value={editing.form.outlet_id ?? ""}
                    onChange={(e) => setEditing({ ...editing, form: { ...editing.form, outlet_id: e.target.value || null } })}
                  >
                    <option value="">All outlets</option>
                    {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </label>
              )}
              <div className="rounded-xl border bg-secondary/30 p-3">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Availability schedule</div>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_LABELS.map((label, idx) => {
                    const active = editing.form.available_days.includes(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          const next = active
                            ? editing.form.available_days.filter((d) => d !== idx)
                            : [...editing.form.available_days, idx].sort((a, b) => a - b);
                          if (next.length === 0) return;
                          setEditing({ ...editing, form: { ...editing.form, available_days: next } });
                        }}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold ${active ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold">
                    <span className="mb-1 block text-muted-foreground">From</span>
                    <input type="time" value={editing.form.available_from} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, available_from: e.target.value } })} className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm" />
                  </label>
                  <label className="text-xs font-semibold">
                    <span className="mb-1 block text-muted-foreground">To</span>
                    <input type="time" value={editing.form.available_to} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, available_to: e.target.value } })} className="w-full rounded-lg border bg-background px-2 py-1.5 text-sm" />
                  </label>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">Dish is hidden from customers outside this window.</div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-semibold">
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={editing.form.veg} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, veg: e.target.checked } })} /> Veg</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={editing.form.spicy} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, spicy: e.target.checked } })} /> Spicy</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={editing.form.bestseller} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, bestseller: e.target.checked } })} /> Bestseller</label>
                <label className="inline-flex items-center gap-1"><input type="checkbox" checked={editing.form.in_stock} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, in_stock: e.target.checked } })} /> In stock</label>
              </div>
            </div>
            <button disabled={save.isPending} className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60">{save.isPending ? "Saving…" : "Save dish"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
