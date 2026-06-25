import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft, Bike, Phone, User as UserIcon, Hash, MapPin, Store, Loader2,
  Power, CheckCircle2, Clock, XCircle, Save, LogOut,
} from "lucide-react";
import { php } from "@/lib/php-api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/rider/profile")({
  head: () => ({ meta: [{ title: "Rider profile — hallifresh" }] }),
  component: RiderProfile,
});

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

const VEHICLES = [
  { value: "bike", label: "Bike" },
  { value: "scooter", label: "Scooter" },
  { value: "bicycle", label: "Bicycle" },
  { value: "car", label: "Car" },
] as const;

function RiderProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const meQ = useQuery({ queryKey: ["rider-me"], queryFn: () => php.rider.me() });
  const outletsQ = useQuery({ queryKey: ["rider-outlets-signup"], queryFn: () => php.rider.outletsForSignup() });

  const rider = meQ.data?.rider;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("bike");
  const [vehicleNo, setVehicleNo] = useState("");
  const [notes, setNotes] = useState("");
  const [outletIds, setOutletIds] = useState<string[]>([]);
  const [pinText, setPinText] = useState("");

  useEffect(() => {
    if (!rider) return;
    setName(rider.name ?? "");
    setPhone(rider.phone ?? "");
    setVehicle(rider.vehicle ?? "bike");
    setVehicleNo(rider.vehicle_no ?? "");
    setNotes(rider.notes ?? "");
    setOutletIds(Array.isArray(rider.preferred_outlets) ? rider.preferred_outlets : []);
    setPinText(Array.isArray(rider.preferred_pincodes) ? rider.preferred_pincodes.join(", ") : "");
  }, [rider]);

  const pincodes = useMemo(
    () => pinText.split(/[,\s]+/).map((p) => p.trim()).filter((p) => /^\d{6}$/.test(p)),
    [pinText],
  );

  const updateM = useMutation({
    mutationFn: (payload: Parameters<typeof php.rider.updateProfile>[0]) => php.rider.updateProfile(payload),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["rider-me"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActiveM = useMutation({
    mutationFn: (is_active: boolean) => php.rider.updateProfile({ is_active }),
    onSuccess: (_d, v) => {
      toast.success(v ? "You're now online" : "You're now offline");
      qc.invalidateQueries({ queryKey: ["rider-me"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (meQ.isLoading || !rider) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const status = (rider.status ?? "pending") as "pending" | "approved" | "rejected";
  const StatusIcon = status === "approved" ? CheckCircle2 : status === "rejected" ? XCircle : Clock;
  const statusColor = status === "approved" ? "emerald" : status === "rejected" ? "rose" : "amber";
  const isActive = !!rider.is_active;

  const toggleOutlet = (id: string) =>
    setOutletIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSave = () => {
    if (status !== "approved") return;
    updateM.mutate({
      name: name.trim(),
      phone: phone.trim(),
      vehicle,
      vehicle_no: vehicleNo.trim(),
      notes: notes.trim(),
      preferred_outlet_ids: outletIds,
      preferred_pincodes: pincodes,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24" style={FONT}>
      {/* Header */}
      <div
        className="px-5 pt-10 pb-8 text-white"
        style={{ background: `linear-gradient(160deg, ${GREEN}, oklch(0.42 0.18 150))` }}
      >
        <div className="flex items-center justify-between">
          <Link
            to="/rider"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/70">Rider profile</div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white/15 text-2xl font-black backdrop-blur">
            {(rider.name?.[0] ?? "R").toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-black">{rider.name}</h1>
            <div className="mt-1 truncate text-xs text-white/80">{user?.email}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full bg-${statusColor}-50 px-3 py-1 text-[11px] font-extrabold text-${statusColor}-700`}>
            <StatusIcon className="h-3 w-3" />
            {status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending approval"}
          </span>
          {status === "approved" && (
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold ${
              isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
            }`}>
              <Power className="h-3 w-3" />
              {isActive ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {status === "rejected" && (
        <div className="mx-5 mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {rider.rejection_reason || "Your application was not approved. Please contact support."}
        </div>
      )}

      {status === "approved" && (
        <div className="mx-5 mt-5 flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
          <div>
            <div className="text-sm font-extrabold text-zinc-900">Availability</div>
            <div className="text-[11px] text-zinc-500">
              {isActive ? "You're receiving new assignments." : "You won't get new orders while offline."}
            </div>
          </div>
          <button
            disabled={toggleActiveM.isPending}
            onClick={() => toggleActiveM.mutate(!isActive)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              isActive ? "bg-emerald-500" : "bg-zinc-300"
            } disabled:opacity-50`}
            aria-label="Toggle availability"
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
              isActive ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
        </div>
      )}

      {/* Personal info */}
      <Section title="Personal info">
        <Field label="Full name" icon={UserIcon}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status !== "approved"}
            className="w-full bg-transparent text-sm font-bold text-zinc-900 outline-none disabled:opacity-60"
          />
        </Field>
        <Field label="Phone" icon={Phone}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            disabled={status !== "approved"}
            className="w-full bg-transparent text-sm font-bold text-zinc-900 outline-none disabled:opacity-60"
          />
        </Field>
      </Section>

      {/* Vehicle */}
      <Section title="Vehicle">
        <Field label="Type" icon={Bike}>
          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            disabled={status !== "approved"}
            className="w-full bg-transparent text-sm font-bold text-zinc-900 outline-none disabled:opacity-60"
          >
            {VEHICLES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Number plate" icon={Hash}>
          <input
            value={vehicleNo}
            onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
            placeholder="KA 01 AB 1234"
            disabled={status !== "approved"}
            className="w-full bg-transparent text-sm font-bold uppercase text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60"
          />
        </Field>
      </Section>

      {/* Zone — pincodes */}
      <Section title="Delivery zone — pincodes" subtitle="6-digit pincodes, separated by commas">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">
            <MapPin className="h-3 w-3" /> Pincodes
          </div>
          <textarea
            value={pinText}
            onChange={(e) => setPinText(e.target.value)}
            disabled={status !== "approved"}
            placeholder="560001, 560002, 560034"
            rows={3}
            className="w-full resize-none bg-transparent text-sm font-bold text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60"
          />
          {pincodes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {pincodes.map((p) => (
                <span key={p} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Zone — outlets */}
      <Section title="Preferred outlets" subtitle="You'll be matched to orders from these outlets first.">
        <div className="space-y-2">
          {outletsQ.isLoading && (
            <div className="grid place-items-center rounded-2xl bg-white p-6">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          )}
          {(outletsQ.data ?? []).map((o: any) => {
            const checked = outletIds.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                disabled={status !== "approved"}
                onClick={() => toggleOutlet(o.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                  checked
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-zinc-200 bg-white"
                } disabled:opacity-60`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${
                  checked ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500"
                }`}>
                  <Store className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold text-zinc-900">{o.name}</div>
                  <div className="truncate text-[11px] text-zinc-500">
                    {[o.partner_restaurants?.name, o.area, o.pincode].filter(Boolean).join(" • ")}
                  </div>
                </div>
                {checked && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </button>
            );
          })}
          {!outletsQ.isLoading && (outletsQ.data ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-center text-xs font-semibold text-zinc-500">
              No outlets available yet.
            </div>
          )}
        </div>
      </Section>

      {/* Notes */}
      <Section title="Notes">
        <div className="rounded-2xl bg-white p-3 shadow-sm">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={status !== "approved"}
            rows={3}
            placeholder="Anything we should know?"
            className="w-full resize-none bg-transparent text-sm font-bold text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60"
          />
        </div>
      </Section>

      {status === "approved" && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-5 py-3">
          <button
            onClick={onSave}
            disabled={updateM.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.55_0.16_145)] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/30 disabled:opacity-60"
          >
            {updateM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="px-5 pt-6">
      <h2 className="text-sm font-extrabold text-zinc-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[11px] text-zinc-500">{subtitle}</p>}
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Field({
  label, icon: Icon, children,
}: { label: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      {children}
    </div>
  );
}
