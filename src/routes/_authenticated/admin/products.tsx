import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListProducts, adminSaveProduct, adminDeleteProduct, adminListCategories } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  image: string;
  weight: string;
  price: number;
  mrp: number;
  eta: string;
  rating: number;
  in_stock: boolean;
};

type FormState = {
  id?: string;
  slug: string;
  name: string;
  category_slug: string;
  image: string;
  weight: string;
  price: string;
  mrp: string;
  eta: string;
  rating: string;
  in_stock: boolean;
};

const empty: FormState = {
  slug: "", name: "", category_slug: "", image: "", weight: "",
  price: "", mrp: "", eta: "11 mins", rating: "4.5", in_stock: true,
};

function ProductsAdmin() {
  const list = useServerFn(adminListProducts);
  const cats = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveProduct);
  const remove = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();
  const { session, loading: authLoading } = useAuth();

  const queryEnabled = !authLoading && !!session;
  const products = useQuery({ queryKey: ["admin", "products", session?.user.id], queryFn: () => list(), enabled: queryEnabled, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false });
  const categories = useQuery({ queryKey: ["admin", "categories", session?.user.id], queryFn: () => cats(), enabled: queryEnabled, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false });

  const [form, setForm] = useState<FormState | null>(null);
  const [q, setQ] = useState("");

  const saveMut = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => {
      toast.success("Product saved");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      setForm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visible = (products.data as ProductRow[] | undefined ?? []).filter((p) =>
    !q.trim() || p.name.toLowerCase().includes(q.toLowerCase()) || p.slug.includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full max-w-xs rounded-xl border bg-secondary/40 px-3 py-2 text-sm outline-none focus:bg-background focus:ring-focus"
        />
        <button
          onClick={() => setForm({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop"
        >
          <Plus className="h-3.5 w-3.5" /> Add product
        </button>
      </div>

      {authLoading || products.isLoading ? (
        <div className="grid h-32 place-items-center"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.weight} · {p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{p.category_slug}</td>
                  <td className="p-3 text-right font-semibold">
                    ₹{p.price}
                    {p.mrp > p.price && <div className="text-xs text-muted-foreground line-through">₹{p.mrp}</div>}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.in_stock ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {p.in_stock ? "In stock" : "Out"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setForm({
                          id: p.id, slug: p.slug, name: p.name, category_slug: p.category_slug,
                          image: p.image, weight: p.weight, price: String(p.price), mrp: String(p.mrp),
                          eta: p.eta, rating: String(p.rating), in_stock: p.in_stock,
                        })}
                        className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${p.name}"?`)) delMut.mutate(p.id); }}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <ProductDrawer
          form={form}
          setForm={setForm}
          categories={categories.data as { slug: string; name: string }[] | undefined ?? []}
          onSave={() => {
            const payload = {
              ...(form.id ? { id: form.id } : {}),
              slug: form.slug.trim(),
              name: form.name.trim(),
              category_slug: form.category_slug.trim(),
              image: form.image.trim(),
              weight: form.weight.trim(),
              price: parseInt(form.price, 10) || 0,
              mrp: parseInt(form.mrp, 10) || 0,
              eta: form.eta.trim() || "11 mins",
              rating: parseFloat(form.rating) || 4.5,
              in_stock: form.in_stock,
            };
            saveMut.mutate(payload);
          }}
          saving={saveMut.isPending}
        />
      )}
    </div>
  );
}

function ProductDrawer({
  form, setForm, categories, onSave, saving,
}: {
  form: FormState;
  setForm: (f: FormState | null) => void;
  categories: { slug: string; name: string }[];
  onSave: () => void;
  saving: boolean;
}) {
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm({ ...form, [k]: v });
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center" onClick={() => setForm(null)}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full overflow-auto rounded-t-2xl bg-background p-6 shadow-pop sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{form.id ? "Edit product" : "New product"}</h2>
          <button onClick={() => setForm(null)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name" full><input className={cls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug (lowercase, dashes)"><input className={cls} value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} /></Field>
          <Field label="Category">
            <select className={cls} value={form.category_slug} onChange={(e) => set("category_slug", e.target.value)}>
              <option value="">Select…</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Image" full>
            <ImageUpload value={form.image} onChange={(v) => set("image", v)} folder="products" />
          </Field>
          <Field label="Weight"><input className={cls} value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="500 g" /></Field>
          <Field label="ETA"><input className={cls} value={form.eta} onChange={(e) => set("eta", e.target.value)} /></Field>
          <Field label="Price (₹)"><input inputMode="numeric" className={cls} value={form.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="MRP (₹)"><input inputMode="numeric" className={cls} value={form.mrp} onChange={(e) => set("mrp", e.target.value.replace(/\D/g, ""))} /></Field>
          <Field label="Rating (0–5)"><input className={cls} value={form.rating} onChange={(e) => set("rating", e.target.value)} /></Field>
          <Field label="In stock">
            <label className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => set("in_stock", e.target.checked)} />
              Available for purchase
            </label>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t pt-4">
          <button onClick={() => setForm(null)} className="rounded-xl border px-4 py-2 text-xs font-semibold">Cancel</button>
          <button onClick={onSave} disabled={saving} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50">
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
const cls = "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus";
