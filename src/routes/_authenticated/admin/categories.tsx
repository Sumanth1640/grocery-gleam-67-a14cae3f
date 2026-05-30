import { createFileRoute } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListCategories, adminSaveCategory, adminDeleteCategory } from "@/lib/admin.functions";
import { useAuth } from "@/lib/use-auth";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

type CatRow = {
  id: string;
  slug: string;
  name: string;
  image: string;
  tint: string;
  sort_order: number;
};
type Form = {
  id?: string;
  slug: string;
  name: string;
  image: string;
  tint: string;
  sort_order: string;
};
const empty: Form = {
  slug: "",
  name: "",
  image: "",
  tint: "oklch(0.95 0.05 145)",
  sort_order: "0",
};

function CategoriesAdmin() {
  const list = useDualFn(adminListCategories, (d) => php.admin.listCategories(d));
  const save = useDualFn(adminSaveCategory, (d) => php.admin.saveCategory(d));
  const remove = useDualFn(adminDeleteCategory, (d) => php.admin.deleteCategory(d));
  const qc = useQueryClient();
  const { session, user, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? user?.id ?? "unknown";
  const cats = useQuery({
    queryKey: ["admin", "categories", userId],
    queryFn: () => list(),
    enabled: !authLoading && !!session && !!user,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [form, setForm] = useState<Form | null>(null);

  const saveMut = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => {
      toast.success("Category saved");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      setForm(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setForm({ ...empty })}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop"
        >
          <Plus className="h-3.5 w-3.5" /> Add category
        </button>
      </div>

      {authLoading || cats.isLoading ? (
        <div className="grid h-32 place-items-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {((cats.data as CatRow[] | undefined) ?? []).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card"
            >
              <div
                className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl"
                style={{ background: c.tint }}
              >
                <img src={c.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">
                  /{c.slug} · order {c.sort_order}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setForm({
                      id: c.id,
                      slug: c.slug,
                      name: c.name,
                      image: c.image,
                      tint: c.tint,
                      sort_order: String(c.sort_order),
                    })
                  }
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${c.name}"?`)) delMut.mutate(c.id);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center"
          onClick={() => setForm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full overflow-auto rounded-t-2xl bg-background p-6 shadow-pop sm:max-w-md sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">
                {form.id ? "Edit category" : "New category"}
              </h2>
              <button
                onClick={() => setForm(null)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <F label="Name">
                <input
                  className={cls}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </F>
              <F label="Slug">
                <input
                  className={cls}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                />
              </F>
              <F label="Image">
                <ImageUpload
                  value={form.image}
                  onChange={(v) => setForm({ ...form, image: v })}
                  folder="categories"
                />
              </F>
              <F label="Tint (CSS color, e.g. oklch(0.95 0.05 145))">
                <input
                  className={cls}
                  value={form.tint}
                  onChange={(e) => setForm({ ...form, tint: e.target.value })}
                />
              </F>
              <F label="Sort order">
                <input
                  inputMode="numeric"
                  className={cls}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: e.target.value.replace(/\D/g, "") })
                  }
                />
              </F>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setForm(null)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  saveMut.mutate({
                    ...(form.id ? { id: form.id } : {}),
                    slug: form.slug.trim(),
                    name: form.name.trim(),
                    image: form.image.trim(),
                    tint: form.tint.trim(),
                    sort_order: parseInt(form.sort_order, 10) || 0,
                  })
                }
                disabled={saveMut.isPending}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50"
              >
                {saveMut.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
const cls =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-focus";
