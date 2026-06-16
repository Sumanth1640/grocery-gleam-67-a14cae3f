import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Bike, Package, MapPin, Phone, CheckCircle2, Truck, Clock, LogOut, Loader2, Wallet,
} from "lucide-react";
import { riderMe, riderMyAssignments, riderUpdateAssignmentStatus, riderApply, riderListOutletsForSignup } from "@/lib/rider.functions";
import { riderMyEarnings } from "@/lib/earnings.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/rider")({
  head: () => ({ meta: [{ title: "Rider — hallifresh" }] }),
  component: RiderHome,
});

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

function RiderHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const meQ = useQuery({ queryKey: ["rider-me"], queryFn: () => riderMe() });
  const rider = meQ.data?.rider;

  const assignQ = useQuery({
    queryKey: ["rider-assignments"],
    queryFn: () => riderMyAssignments(),
    enabled: !!rider && rider.status === "approved",
    refetchInterval: 15_000,
  });

  const updateM = useMutation({
    mutationFn: (v: { assignment_id: string; status: "picked_up" | "delivered" }) =>
      riderUpdateAssignmentStatus({ data: v }),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["rider-assignments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Play a soft chime when a new active assignment appears.
  const prevActiveRef = useRef<number | null>(null);
  useEffect(() => {
    const list = assignQ.data ?? [];
    const activeCount = list.filter((a: any) => a.status === "assigned").length;
    if (prevActiveRef.current !== null && activeCount > prevActiveRef.current) {
      playChime();
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("New delivery assigned", { body: "Open the rider app to view details." });
      }
    }
    prevActiveRef.current = activeCount;
  }, [assignQ.data]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  if (meQ.isLoading) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  if (!rider) {
    return (
      <div className="min-h-screen bg-white" style={FONT}>
        <Header title="Become a rider" />
        <ApplyForm onApplied={() => qc.invalidateQueries({ queryKey: ["rider-me"] })} />
      </div>
    );
  }

  if (rider.status === "pending") {
    return (
      <PendingState
        rider={rider}
        onSignOut={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
      />
    );
  }

  if (rider.status === "rejected") {
    return (
      <div className="min-h-screen bg-white" style={FONT}>
        <Header title="Application update" />
        <div className="px-6 pt-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-rose-50 text-rose-600">
            <Bike className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-xl font-extrabold">Application not approved</h2>
          <p className="mt-2 text-sm text-zinc-500">{rider.rejection_reason || "Please contact support."}</p>
        </div>
      </div>
    );
  }

  const list = assignQ.data ?? [];
  const active = list.filter((a: any) => a.status === "assigned" || a.status === "picked_up");
  const past = list.filter((a: any) => a.status === "delivered" || a.status === "cancelled");

  return (
    <div className="min-h-screen bg-zinc-50 pb-10" style={FONT}>
      <div className="px-5 pt-10 pb-6 text-white" style={{ background: `linear-gradient(160deg, ${GREEN}, oklch(0.42 0.18 150))` }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/70">Rider dashboard</div>
            <h1 className="font-display text-2xl font-black">Hi, {rider.name.split(" ")[0]}</h1>
            <div className="mt-1 text-xs text-white/80">{rider.vehicle} · {rider.vehicle_no || "—"}</div>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="Active" value={active.length} />
          <Stat label="Today" value={past.filter((a:any) => isToday(a.delivered_at)).length} />
          <Stat label="Total" value={past.length} />
        </div>
      </div>

      <section className="px-5 pt-5">
        <h2 className="text-sm font-extrabold text-zinc-900">Active deliveries</h2>
        <div className="mt-3 space-y-3">
          {active.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center text-xs font-semibold text-zinc-500">
              No active deliveries right now.
            </div>
          )}
          {active.map((a: any) => (
            <DeliveryCard
              key={a.id}
              a={a}
              busy={updateM.isPending}
              onPickup={() => updateM.mutate({ assignment_id: a.id, status: "picked_up" })}
              onDeliver={() => updateM.mutate({ assignment_id: a.id, status: "delivered" })}
            />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section className="px-5 pt-6">
          <h2 className="text-sm font-extrabold text-zinc-900">Recent</h2>
          <div className="mt-3 space-y-2">
            {past.slice(0, 10).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-zinc-900">Order #{shortId(a.order_id)}</div>
                  <div className="text-[11px] text-zinc-500">{fmtDate(a.delivered_at)}</div>
                </div>
                <div className="text-xs font-extrabold text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Delivered
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <EarningsSection />


      <div className="px-5 pt-6">
        <Link to="/" className="block text-center text-xs font-bold text-zinc-500">← Customer view</Link>
      </div>
      <div className="px-5 pt-3 text-center text-[10px] text-zinc-400">{user?.email}</div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pb-3 pt-10 backdrop-blur-xl">
      <Link to="/" className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100">
        <ChevronLeft className="h-5 w-5 text-zinc-700" strokeWidth={2.5} />
      </Link>
      <h1 className="font-display text-base font-extrabold text-zinc-900">{title}</h1>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur p-3 text-center">
      <div className="font-display text-2xl font-black">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">{label}</div>
    </div>
  );
}

function DeliveryCard({ a, busy, onPickup, onDeliver }: { a: any; busy: boolean; onPickup: () => void; onDeliver: () => void }) {
  const o = a.orders ?? {};
  const addr = o.address ?? {};
  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
            <Package className="h-3 w-3" /> Order #{shortId(a.order_id)}
          </div>
          <div className="mt-1.5 font-display text-lg font-black text-zinc-900">₹{o.total ?? "—"}</div>
          <div className="text-[11px] font-semibold text-zinc-500 capitalize">{o.payment} · {fmtDate(o.created_at)}</div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
          a.status === "picked_up" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
        }`}>{a.status === "picked_up" ? "On the way" : "Pickup"}</span>
      </div>

      <div className="mt-3 rounded-xl bg-zinc-50 p-3">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="min-w-0 text-xs font-semibold text-zinc-700">
            <div className="font-extrabold text-zinc-900">{addr.full_name || addr.fullName || "Customer"}</div>
            <div className="line-clamp-2">{[addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(", ")}</div>
          </div>
        </div>
        {addr.phone && (
          <a href={`tel:${addr.phone}`} className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700">
            <Phone className="h-3 w-3" /> {addr.phone}
          </a>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        {a.status === "assigned" ? (
          <button disabled={busy} onClick={onPickup} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-extrabold text-white disabled:opacity-60">
            <Truck className="mr-1 inline h-3.5 w-3.5" /> Mark picked up
          </button>
        ) : (
          <button disabled={busy} onClick={onDeliver} className="flex-1 rounded-2xl bg-[oklch(0.55_0.16_145)] px-4 py-3 text-xs font-extrabold text-white disabled:opacity-60">
            <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Mark delivered
          </button>
        )}
      </div>
    </div>
  );
}

function PendingState({ rider, onSignOut }: { rider: any; onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-white" style={FONT}>
      <Header title="Application pending" />
      <div className="px-6 pt-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-amber-600">
          <Clock className="h-8 w-8" />
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold">We're reviewing your application</h2>
        <p className="mt-2 text-sm text-zinc-500">Hi {rider.name.split(" ")[0]}, admin will approve your account soon. You'll get a notification.</p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-zinc-50 p-4 text-left text-xs">
          <Row k="Name" v={rider.name} />
          <Row k="Phone" v={rider.phone} />
          <Row k="Vehicle" v={`${rider.vehicle} · ${rider.vehicle_no || "—"}`} />
        </div>
        <button onClick={onSignOut} className="mt-6 text-xs font-bold text-zinc-500">Sign out</button>
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="font-bold text-zinc-500">{k}</span>
      <span className="font-extrabold text-zinc-900">{v}</span>
    </div>
  );
}

function ApplyForm({ onApplied }: { onApplied: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState<"bike" | "scooter" | "bicycle" | "car">("bike");
  const [vehicleNo, setVehicleNo] = useState("");
  const [notes, setNotes] = useState("");
  const [selOutlets, setSelOutlets] = useState<Set<string>>(new Set());
  const [pincodesText, setPincodesText] = useState("");
  const [outletsOpen, setOutletsOpen] = useState(false);

  const outletsQ = useQuery({ queryKey: ["rider-signup-outlets"], queryFn: () => riderListOutletsForSignup() });
  const outlets = (outletsQ.data ?? []) as any[];

  const toggleOutlet = (id: string) => {
    const n = new Set(selOutlets);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelOutlets(n);
  };

  const m = useMutation({
    mutationFn: () => riderApply({ data: {
      name, phone, vehicle, vehicle_no: vehicleNo, notes,
      preferred_outlet_ids: Array.from(selOutlets),
      preferred_pincodes: pincodesText.split(/[,\s]+/).map((s) => s.trim()).filter((s) => /^\d{6}$/.test(s)),
    } }),
    onSuccess: () => { toast.success("Application submitted!"); onApplied(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const valid = name.trim().length > 1 && /^\d{10}$/.test(phone);

  return (
    <div className="px-5 pb-10">
      <div className="rounded-3xl p-5 text-white" style={{ background: `linear-gradient(155deg, ${GREEN}, oklch(0.42 0.18 150))` }}>
        <Bike className="h-7 w-7" />
        <div className="mt-2 font-display text-xl font-black">Deliver with hallifresh</div>
        <p className="mt-1 text-xs text-white/85">Earn flexibly. Admin will approve your account.</p>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Full name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={input} />
        </Field>
        <Field label="Phone">
          <input value={phone} inputMode="numeric" onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit" className={input} />
        </Field>
        <Field label="Vehicle">
          <div className="flex gap-2">
            {(["bike", "scooter", "bicycle", "car"] as const).map((v) => (
              <button key={v} type="button" onClick={() => setVehicle(v)} className={`flex-1 rounded-2xl border py-2 text-xs font-extrabold capitalize ${
                vehicle === v ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600"
              }`}>{v}</button>
            ))}
          </div>
        </Field>
        <Field label="Vehicle number">
          <input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} placeholder="KA01AB1234" className={input} />
        </Field>

        <Field label={`Preferred outlets (${selOutlets.size} selected)`}>
          <button
            type="button"
            onClick={() => setOutletsOpen((v) => !v)}
            className={input + " text-left"}
          >
            {selOutlets.size === 0
              ? <span className="text-zinc-400">Tap to pick outlets you can serve</span>
              : <span>{outlets.filter((o) => selOutlets.has(o.id)).map((o) => o.name).slice(0, 3).join(", ")}{selOutlets.size > 3 ? ` +${selOutlets.size - 3}` : ""}</span>}
          </button>
          {outletsOpen && (
            <div className="mt-2 max-h-60 space-y-1 overflow-auto rounded-2xl border border-zinc-200 bg-white p-2">
              {outletsQ.isLoading && <Loader2 className="m-3 h-4 w-4 animate-spin text-zinc-400" />}
              {!outletsQ.isLoading && outlets.length === 0 && (
                <div className="p-3 text-center text-xs text-zinc-500">No outlets available right now.</div>
              )}
              {outlets.map((o) => (
                <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-sm hover:bg-zinc-50">
                  <input type="checkbox" checked={selOutlets.has(o.id)} onChange={() => toggleOutlet(o.id)} />
                  <span className="flex-1">
                    <span className="font-bold text-zinc-900">{o.name}</span>
                    <span className="ml-1 text-[11px] text-zinc-500">{o.partner_restaurants?.name} · {o.area || o.pincode || ""}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </Field>

        <Field label="Preferred pincodes (comma-separated, 6-digit)">
          <textarea
            value={pincodesText}
            onChange={(e) => setPincodesText(e.target.value)}
            rows={2}
            placeholder="560001, 560002"
            className={input}
          />
        </Field>

        <Field label="Anything else? (optional)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={input} />
        </Field>

        <button
          disabled={!valid || m.isPending}
          onClick={() => m.mutate()}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 disabled:opacity-50"
          style={{ background: GREEN }}
        >
          {m.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit application
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
      {children}
    </label>
  );
}
const input = "w-full rounded-2xl border-none bg-zinc-100 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30";

function EarningsSection() {
  const q = useQuery({ queryKey: ["rider-my-earnings"], queryFn: () => riderMyEarnings(), refetchInterval: 30_000 });
  const d = q.data;
  if (q.isLoading) return null;
  if (!d || (d.rows.length === 0 && d.summary.today === 0 && d.summary.pending === 0)) {
    return (
      <section className="px-5 pt-6">
        <h2 className="text-sm font-extrabold text-zinc-900 inline-flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" /> Earnings</h2>
        <div className="mt-3 rounded-2xl border border-dashed border-zinc-200 bg-white p-6 text-center text-xs font-semibold text-zinc-500">
          You'll earn per delivered order. Numbers appear here after your first delivery.
        </div>
      </section>
    );
  }
  return (
    <section className="px-5 pt-6">
      <h2 className="text-sm font-extrabold text-zinc-900 inline-flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-600" /> Earnings</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Money label="Today" v={d.summary.today} />
        <Money label="7 days" v={d.summary.week} />
        <Money label="Month" v={d.summary.month} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-amber-50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending payout</div>
          <div className="font-display text-xl font-black text-amber-900">₹{d.summary.pending.toFixed(2)}</div>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Paid out</div>
          <div className="font-display text-xl font-black text-emerald-900">₹{d.summary.paid.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {d.rows.slice(0, 8).map((r: any) => (
          <div key={r.id} className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-zinc-900">Order #{shortId(r.order_id)}</div>
              <div className="text-[11px] text-zinc-500">{fmtDate(r.earned_at)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-extrabold text-zinc-900">₹{Number(r.total).toFixed(2)}</div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${r.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{r.status}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Money({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <div className="font-display text-lg font-black text-zinc-900">₹{v.toFixed(0)}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}


function shortId(id?: string) { return (id ?? "").slice(0, 8); }
function fmtDate(s?: string | null) { if (!s) return ""; try { return new Date(s).toLocaleString(); } catch { return ""; } }
function isToday(s?: string | null) { if (!s) return false; const d = new Date(s); const n = new Date(); return d.toDateString() === n.toDateString(); }

function playChime() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    o.start(); o.stop(ctx.currentTime + 0.5);
    setTimeout(() => {
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination); o2.type = "sine"; o2.frequency.value = 1320;
      g2.gain.setValueAtTime(0.001, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o2.start(); o2.stop(ctx.currentTime + 0.45);
    }, 180);
  } catch {}
}
