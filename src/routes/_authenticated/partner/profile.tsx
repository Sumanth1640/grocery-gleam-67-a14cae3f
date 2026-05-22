import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  myRestaurant,
  saveBasics,
  saveDocuments,
  advanceAfterMenu,
  acceptAgreement,
  submitForReview,
  checkSlugAvailable,
} from "@/lib/partner.functions";
import { toast } from "sonner";
import { Loader2, Save, ArrowRight, ArrowLeft, CheckCircle2, Circle, AlertCircle, FileText } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/partner/profile")({
  component: ProfileWizard,
});

const STEPS = [
  { n: 1, label: "Basics" },
  { n: 2, label: "Documents" },
  { n: 3, label: "Menu" },
  { n: 4, label: "Agreement" },
  { n: 5, label: "Submit" },
];

const inputCls = "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-focus";

function ProfileWizard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const fetchFn = useServerFn(myRestaurant);
  const q = useQuery({ queryKey: ["my-restaurant"], queryFn: () => fetchFn() });
  const r = q.data;
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (r) setStep(Math.min(Math.max(r.onboarding_step ?? 1, 1), 5));
  }, [r]);

  if (q.isLoading || !user) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  const goNext = () => setStep((s) => Math.min(5, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));
  const reload = () => qc.invalidateQueries({ queryKey: ["my-restaurant"] });

  return (
    <div className="max-w-3xl">
      <Stepper current={step} onJump={(n) => { if (r && n <= (r.onboarding_step ?? 1)) setStep(n); }} maxReached={(r?.onboarding_step ?? 1)} />
      {r?.status === "rejected" && r.rejection_reason && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div><b>Application rejected.</b> {r.rejection_reason} — please update and resubmit.</div>
        </div>
      )}
      <div className="mt-4 rounded-2xl border bg-card p-6 shadow-card">
        {step === 1 && <StepBasics r={r} onSaved={() => { reload(); goNext(); }} />}
        {step === 2 && <StepDocuments r={r} userId={user.id} onSaved={() => { reload(); goNext(); }} onBack={goPrev} />}
        {step === 3 && <StepMenu onAdvance={() => { reload(); goNext(); }} onBack={goPrev} />}
        {step === 4 && <StepAgreement r={r} onSaved={() => { reload(); goNext(); }} onBack={goPrev} />}
        {step === 5 && <StepSubmit r={r} onSubmitted={reload} onBack={goPrev} />}
      </div>
    </div>
  );
}

function Stepper({ current, onJump, maxReached }: { current: number; onJump: (n: number) => void; maxReached: number }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto rounded-2xl border bg-card p-2 text-xs">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        const reachable = s.n <= maxReached;
        return (
          <li key={s.n} className="flex flex-1 items-center gap-1 min-w-0">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onJump(s.n)}
              className={`inline-flex w-full items-center gap-1.5 rounded-xl px-2 py-1.5 font-bold transition ${active ? "bg-primary text-primary-foreground" : done ? "text-success" : reachable ? "hover:bg-secondary" : "text-muted-foreground opacity-60"}`}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
              <span className="truncate">{s.n}. {s.label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-2 shrink-0 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------- Step 1: Basics ----------------
function StepBasics({ r, onSaved }: { r: Awaited<ReturnType<typeof myRestaurant>> | undefined; onSaved: () => void }) {
  const saveFn = useServerFn(saveBasics);
  const slugFn = useServerFn(checkSlugAvailable);
  const [form, setForm] = useState({
    name: r?.name ?? "", slug: r?.slug ?? "",
    cuisines: (r?.cuisines ?? []).join(", "),
    image: r?.image ?? "", cover: r?.cover ?? "",
    eta_mins: r?.eta_mins ?? 30, cost_for_two: r?.cost_for_two ?? 400,
    veg: r?.veg ?? false, price_tier: r?.price_tier ?? 2,
    offer: r?.offer ?? "", area: r?.area ?? "", distance_km: Number(r?.distance_km ?? 1.5),
    opens_at: r?.opens_at ?? "10:00", closes_at: r?.closes_at ?? "23:00",
    is_open: r?.is_open ?? true,
    owner_name: r?.owner_name ?? "", owner_email: r?.owner_email ?? "", owner_phone: r?.owner_phone ?? "",
  });
  const [slugState, setSlugState] = useState<"idle" | "checking" | "ok" | "taken">("idle");
  const set = (k: keyof typeof form, v: unknown) => setForm({ ...form, [k]: v as never });

  useEffect(() => {
    if (!form.slug || form.slug.length < 2) { setSlugState("idle"); return; }
    setSlugState("checking");
    const t = setTimeout(async () => {
      try {
        const res = await slugFn({ data: { slug: form.slug } });
        setSlugState(res.available ? "ok" : "taken");
      } catch { setSlugState("idle"); }
    }, 400);
    return () => clearTimeout(t);
  }, [form.slug, slugFn]);

  const save = useMutation({
    mutationFn: async () => {
      if (slugState === "taken") throw new Error("That URL slug is taken");
      await saveFn({ data: {
        ...form,
        cuisines: form.cuisines.split(",").map((s) => s.trim()).filter(Boolean),
        offer: form.offer || null,
      } });
    },
    onSuccess: () => { toast.success("Basics saved"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <h2 className="font-display text-xl font-bold">Step 1 · Basic details</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tell us about your restaurant and how to reach you.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Restaurant name"><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} required minLength={2} /></Field>
        <Field label="URL slug">
          <input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} className={inputCls} required minLength={2} />
          <div className="mt-1 text-[11px]">
            {slugState === "checking" && <span className="text-muted-foreground">Checking…</span>}
            {slugState === "ok" && <span className="text-success">✓ Available</span>}
            {slugState === "taken" && <span className="text-destructive">✗ Already taken</span>}
          </div>
        </Field>
        <Field label="Cuisines (comma-separated)" className="sm:col-span-2"><input value={form.cuisines} onChange={(e) => set("cuisines", e.target.value)} className={inputCls} placeholder="Indian, Mughlai, Biryani" required /></Field>
        <Field label="Owner name"><input value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} className={inputCls} required /></Field>
        <Field label="Owner email"><input type="email" value={form.owner_email} onChange={(e) => set("owner_email", e.target.value)} className={inputCls} required /></Field>
        <Field label="Owner phone"><input value={form.owner_phone} onChange={(e) => set("owner_phone", e.target.value)} className={inputCls} required /></Field>
        <Field label="Area / locality"><input value={form.area} onChange={(e) => set("area", e.target.value)} className={inputCls} required /></Field>
        <Field label="Distance (km)"><input type="number" step="0.1" value={form.distance_km} onChange={(e) => set("distance_km", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="ETA (mins)"><input type="number" value={form.eta_mins} onChange={(e) => set("eta_mins", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="Cost for two (₹)"><input type="number" value={form.cost_for_two} onChange={(e) => set("cost_for_two", Number(e.target.value))} className={inputCls} /></Field>
        <Field label="Opens at"><input value={form.opens_at} onChange={(e) => set("opens_at", e.target.value)} className={inputCls} placeholder="10:00" /></Field>
        <Field label="Closes at"><input value={form.closes_at} onChange={(e) => set("closes_at", e.target.value)} className={inputCls} placeholder="23:00" /></Field>
        <Field label="Logo image" className="sm:col-span-2"><ImageUpload value={form.image} onChange={(url) => set("image", url)} folder="restaurants" /></Field>
        <Field label="Cover image" className="sm:col-span-2"><ImageUpload value={form.cover} onChange={(url) => set("cover", url)} folder="restaurants" /></Field>
        <Field label="Offer badge (optional)" className="sm:col-span-2"><input value={form.offer ?? ""} onChange={(e) => set("offer", e.target.value)} className={inputCls} placeholder="50% OFF up to ₹100" /></Field>
        <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.veg} onChange={(e) => set("veg", e.target.checked)} /> Pure vegetarian</label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_open} onChange={(e) => set("is_open", e.target.checked)} /> Currently accepting orders</label>
      </div>
      <div className="mt-6 flex justify-end">
        <button disabled={save.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save & continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

// ---------------- Step 2: Documents ----------------
function StepDocuments({ r, userId, onSaved, onBack }: { r: Awaited<ReturnType<typeof myRestaurant>> | undefined; userId: string; onSaved: () => void; onBack: () => void }) {
  const saveFn = useServerFn(saveDocuments);
  const [form, setForm] = useState({
    fssai_number: r?.fssai_number ?? "", fssai_doc_url: r?.fssai_doc_url ?? "", fssai_expiry: r?.fssai_expiry ?? "",
    pan_number: r?.pan_number ?? "", pan_doc_url: r?.pan_doc_url ?? "",
    gst_number: r?.gst_number ?? "", gst_doc_url: r?.gst_doc_url ?? "",
    bank_account_name: r?.bank_account_name ?? "", bank_account_number: r?.bank_account_number ?? "",
    bank_ifsc: r?.bank_ifsc ?? "", bank_proof_url: r?.bank_proof_url ?? "",
    shop_license_doc_url: r?.shop_license_doc_url ?? "",
  });
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: v });

  const save = useMutation({
    mutationFn: async () => { await saveFn({ data: { ...form, gst_number: form.gst_number || null, gst_doc_url: form.gst_doc_url || null } }); },
    onSuccess: () => { toast.success("Documents saved"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
      <h2 className="font-display text-xl font-bold">Step 2 · Documents</h2>
      <p className="mt-1 text-sm text-muted-foreground">Upload clear scans or photos. Files are private and only visible to you and our verification team.</p>
      <div className="mt-5 grid gap-4">
        <Section title="FSSAI license">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="FSSAI number"><input value={form.fssai_number} onChange={(e) => set("fssai_number", e.target.value)} className={inputCls} required /></Field>
            <Field label="Expires on"><input type="date" value={form.fssai_expiry} onChange={(e) => set("fssai_expiry", e.target.value)} className={inputCls} required /></Field>
          </div>
          <DocumentUpload value={form.fssai_doc_url} onChange={(p) => set("fssai_doc_url", p)} kind="fssai" userId={userId} label="FSSAI certificate" />
        </Section>
        <Section title="PAN card">
          <Field label="PAN number"><input value={form.pan_number} onChange={(e) => set("pan_number", e.target.value.toUpperCase())} className={inputCls} required maxLength={10} /></Field>
          <DocumentUpload value={form.pan_doc_url} onChange={(p) => set("pan_doc_url", p)} kind="pan" userId={userId} label="PAN card scan" />
        </Section>
        <Section title="GST (optional)">
          <Field label="GSTIN"><input value={form.gst_number ?? ""} onChange={(e) => set("gst_number", e.target.value.toUpperCase())} className={inputCls} /></Field>
          <DocumentUpload value={form.gst_doc_url ?? ""} onChange={(p) => set("gst_doc_url", p)} kind="gst" userId={userId} label="GST certificate" />
        </Section>
        <Section title="Bank details">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account holder name"><input value={form.bank_account_name} onChange={(e) => set("bank_account_name", e.target.value)} className={inputCls} required /></Field>
            <Field label="Account number"><input value={form.bank_account_number} onChange={(e) => set("bank_account_number", e.target.value)} className={inputCls} required /></Field>
            <Field label="IFSC"><input value={form.bank_ifsc} onChange={(e) => set("bank_ifsc", e.target.value.toUpperCase())} className={inputCls} required /></Field>
          </div>
          <DocumentUpload value={form.bank_proof_url} onChange={(p) => set("bank_proof_url", p)} kind="bank" userId={userId} label="Cancelled cheque / bank statement" />
        </Section>
        <Section title="Shop establishment proof">
          <DocumentUpload value={form.shop_license_doc_url} onChange={(p) => set("shop_license_doc_url", p)} kind="shop-license" userId={userId} label="Shop establishment / trade license" />
        </Section>
      </div>
      <NavButtons onBack={onBack} pending={save.isPending} />
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-secondary/30 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold"><FileText className="h-4 w-4 text-primary" /> {title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ---------------- Step 3: Menu ----------------
function StepMenu({ onAdvance, onBack }: { onAdvance: () => void; onBack: () => void }) {
  const advanceFn = useServerFn(advanceAfterMenu);
  const m = useMutation({
    mutationFn: async () => { await advanceFn(); },
    onSuccess: onAdvance,
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <h2 className="font-display text-xl font-bold">Step 3 · Menu</h2>
      <p className="mt-1 text-sm text-muted-foreground">Add at least one dish with price and a clear photo. You can keep adding more later.</p>
      <div className="mt-5 rounded-xl border bg-secondary/30 p-6 text-center">
        <p className="text-sm">Open the menu manager to add or edit dishes, then come back here to continue.</p>
        <Link to="/partner/menu" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop">
          Open menu manager <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-4 py-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Back</button>
        <button onClick={() => m.mutate()} disabled={m.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} I've added my menu <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------- Step 4: Agreement ----------------
function StepAgreement({ r, onSaved, onBack }: { r: Awaited<ReturnType<typeof myRestaurant>> | undefined; onSaved: () => void; onBack: () => void }) {
  const fn = useServerFn(acceptAgreement);
  const [agreed, setAgreed] = useState(!!r?.agreement_accepted_at);
  const [sig, setSig] = useState(r?.agreement_signature ?? "");
  const m = useMutation({
    mutationFn: async () => { await fn({ data: { agreement_signature: sig, agreement_version: "v1.0" } }); },
    onSuccess: () => { toast.success("Agreement accepted"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!agreed || sig.trim().length < 2) { toast.error("Please agree and sign"); return; } m.mutate(); }}>
      <h2 className="font-display text-xl font-bold">Step 4 · Partner agreement</h2>
      <p className="mt-1 text-sm text-muted-foreground">Review the commercial terms and sign to proceed.</p>

      <div className="mt-4 rounded-xl border bg-secondary/30 p-4">
        <div className="text-sm font-bold">Commission</div>
        <p className="mt-1 text-sm text-muted-foreground">Commission is <b>18% – 30%</b> depending on your category, area, and order volume. Once approved, your final rate will be set by our partnerships team and shown on your dashboard. Standard rate at launch: <b>{r?.commission_rate ?? 22}%</b>.</p>
      </div>

      <div className="mt-4 max-h-64 overflow-auto rounded-xl border bg-background p-4 text-sm leading-6 text-muted-foreground">
        <p><b>1. Listing:</b> You agree to list your restaurant exclusively under the name and brand approved in your profile. Menu, prices, and availability must match what is served at the outlet.</p>
        <p className="mt-3"><b>2. Quality & hygiene:</b> You will maintain a valid FSSAI license, follow food-safety guidelines, and package every order securely.</p>
        <p className="mt-3"><b>3. Order acceptance:</b> When marked open, you commit to accepting and preparing orders within the stated ETA. Repeated cancellations may lead to delisting.</p>
        <p className="mt-3"><b>4. Pricing & payout:</b> Net payout = order total − commission − applicable taxes. Payouts are remitted weekly to the bank account on file.</p>
        <p className="mt-3"><b>5. Termination:</b> Either party may terminate this agreement with 14 days notice. Documents and order history will be retained as required by law.</p>
      </div>

      <div className="mt-4 space-y-3">
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
          <span>I have read and agree to the partner terms above, and confirm I am authorised to bind this restaurant.</span>
        </label>
        <Field label="Type your full name as signature">
          <input value={sig} onChange={(e) => setSig(e.target.value)} className={inputCls} placeholder="e.g. Priya Sharma" required minLength={2} />
        </Field>
      </div>

      <NavButtons onBack={onBack} pending={m.isPending} ctaLabel={r?.agreement_accepted_at ? "Update & continue" : "Sign & continue"} />
    </form>
  );
}

// ---------------- Step 5: Submit ----------------
function StepSubmit({ r, onSubmitted, onBack }: { r: Awaited<ReturnType<typeof myRestaurant>> | undefined; onSubmitted: () => void; onBack: () => void }) {
  const fn = useServerFn(submitForReview);
  const m = useMutation({
    mutationFn: async () => { await fn(); },
    onSuccess: () => { toast.success("Submitted for review"); onSubmitted(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const checks = useMemo(() => ([
    { ok: !!(r?.name && r?.slug && r?.area && r?.owner_email && r?.owner_phone), label: "Basics complete" },
    { ok: !!(r?.fssai_number && r?.fssai_doc_url), label: "FSSAI license uploaded" },
    { ok: !!(r?.pan_number && r?.pan_doc_url), label: "PAN uploaded" },
    { ok: !!(r?.bank_account_number && r?.bank_ifsc && r?.bank_proof_url), label: "Bank details uploaded" },
    { ok: !!r?.shop_license_doc_url, label: "Shop license uploaded" },
    { ok: !!r?.agreement_accepted_at, label: "Agreement signed" },
  ]), [r]);
  const allOk = checks.every((c) => c.ok);

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Step 5 · Submit for review</h2>
      <p className="mt-1 text-sm text-muted-foreground">Our team reviews submissions within 24 hours. You'll get a notification when your restaurant is live.</p>

      <ul className="mt-5 space-y-2">
        {checks.map((c) => (
          <li key={c.label} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${c.ok ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
            {c.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-destructive" />} {c.label}
          </li>
        ))}
      </ul>

      {r?.status === "approved" && (
        <div className="mt-5 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
          <b>You're live!</b> Customers can now find {r.name} on hallifresh.
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-4 py-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> Back</button>
        <button onClick={() => m.mutate()} disabled={!allOk || m.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60">
          {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Submit for review
        </button>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={`block ${className}`}><div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>{children}</label>;
}

function NavButtons({ onBack, pending, ctaLabel = "Save & continue" }: { onBack: () => void; pending: boolean; ctaLabel?: string }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 rounded-xl border bg-background px-4 py-2 text-sm font-semibold">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <button disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {ctaLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
