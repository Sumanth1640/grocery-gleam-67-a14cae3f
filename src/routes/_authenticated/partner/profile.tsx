import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myRestaurant, createMyRestaurant, updateMyRestaurant } from "@/lib/partner.functions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/partner/profile")({
  component: ProfilePage,
});

const empty = {
  name: "", slug: "", cuisines: "", image: "", cover: "",
  eta_mins: 30, cost_for_two: 400, veg: false, price_tier: 2,
  offer: "", area: "", distance_km: 1.5, opens_at: "10:00", closes_at: "23:00", is_open: true,
};

function ProfilePage() {
  const qc = useQueryClient();
  const fetchFn = useServerFn(myRestaurant);
  const createFn = useServerFn(createMyRestaurant);
  const updateFn = useServerFn(updateMyRestaurant);
  const q = useQuery({ queryKey: ["my-restaurant"], queryFn: () => fetchFn() });
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (q.data) {
      setForm({
        name: q.data.name, slug: q.data.slug, cuisines: (q.data.cuisines ?? []).join(", "),
        image: q.data.image ?? "", cover: q.data.cover ?? "",
        eta_mins: q.data.eta_mins, cost_for_two: q.data.cost_for_two,
        veg: q.data.veg, price_tier: q.data.price_tier,
        offer: q.data.offer ?? "", area: q.data.area, distance_km: Number(q.data.distance_km),
        opens_at: q.data.opens_at ?? "10:00", closes_at: q.data.closes_at ?? "23:00",
        is_open: q.data.is_open,
      });
    }
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        cuisines: form.cuisines.split(",").map((s) => s.trim()).filter(Boolean),
        offer: form.offer || null,
      };
      if (q.data) await updateFn({ data: { id: q.data.id, patch: payload } });
      else await createFn({ data: payload });
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["my-restaurant"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const set = (k: keyof typeof form, v: unknown) => setForm({ ...form, [k]: v as never });
  const input = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-focus";

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="max-w-3xl rounded-2xl border bg-card p-6 shadow-card">
      <h1 className="font-display text-2xl font-bold">Restaurant profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">{q.data ? "Update your restaurant details. Re-approval may be required for major changes." : "Tell us about your restaurant. We'll review within 24 hours."}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Restaurant name"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={input} required /></Field>
        <Field label="URL slug (lowercase, dashes)"><input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={input} required /></Field>
        <Field label="Cuisines (comma-separated)" className="sm:col-span-2"><input value={form.cuisines} onChange={(e) => set("cuisines", e.target.value)} className={input} placeholder="Indian, Mughlai, Biryani" required /></Field>
        <Field label="Area"><input value={form.area} onChange={(e) => set("area", e.target.value)} className={input} required /></Field>
        <Field label="Distance (km)"><input type="number" step="0.1" value={form.distance_km} onChange={(e) => set("distance_km", Number(e.target.value))} className={input} /></Field>
        <Field label="Logo image URL"><input value={form.image} onChange={(e) => set("image", e.target.value)} className={input} placeholder="https://..." /></Field>
        <Field label="Cover image URL"><input value={form.cover} onChange={(e) => set("cover", e.target.value)} className={input} placeholder="https://..." /></Field>
        <Field label="ETA (mins)"><input type="number" value={form.eta_mins} onChange={(e) => set("eta_mins", Number(e.target.value))} className={input} /></Field>
        <Field label="Cost for two (₹)"><input type="number" value={form.cost_for_two} onChange={(e) => set("cost_for_two", Number(e.target.value))} className={input} /></Field>
        <Field label="Price tier (1–3)"><input type="number" min={1} max={3} value={form.price_tier} onChange={(e) => set("price_tier", Number(e.target.value))} className={input} /></Field>
        <Field label="Opens at"><input value={form.opens_at} onChange={(e) => set("opens_at", e.target.value)} className={input} placeholder="10:00" /></Field>
        <Field label="Closes at"><input value={form.closes_at} onChange={(e) => set("closes_at", e.target.value)} className={input} placeholder="23:00" /></Field>
        <Field label="Offer (optional)" className="sm:col-span-2"><input value={form.offer} onChange={(e) => set("offer", e.target.value)} className={input} placeholder="50% OFF up to ₹100" /></Field>
        <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.veg} onChange={(e) => set("veg", e.target.checked)} /> Pure vegetarian</label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_open} onChange={(e) => set("is_open", e.target.checked)} /> Currently accepting orders</label>
      </div>
      <button disabled={save.isPending} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60">
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {q.data ? "Save changes" : "Submit for review"}
      </button>
    </form>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>{children}</label>;
}
