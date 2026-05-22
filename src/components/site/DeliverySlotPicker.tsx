import { useMemo } from "react";
import { Clock, Zap } from "lucide-react";

export type DeliverySlot = { id: string; label: string; iso: string | null };

function buildSlots(baseEtaMins = 30): DeliverySlot[] {
  const slots: DeliverySlot[] = [
    { id: "asap", label: `ASAP · ~${baseEtaMins} min`, iso: null },
  ];
  const now = new Date();
  // Start at next full 30 minutes, at least 1 hour out
  const start = new Date(now.getTime() + 60 * 60 * 1000);
  start.setMinutes(start.getMinutes() < 30 ? 30 : 0, 0, 0);
  if (start.getMinutes() === 0 && now.getMinutes() >= 30) start.setHours(start.getHours() + 1);

  for (let i = 0; i < 8; i++) {
    const d = new Date(start.getTime() + i * 30 * 60 * 1000);
    const hh = d.getHours();
    const mm = d.getMinutes();
    const day = d.toDateString() === now.toDateString() ? "Today" : "Tomorrow";
    const label = `${day} · ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    slots.push({ id: d.toISOString(), label, iso: d.toISOString() });
  }
  return slots;
}

export function DeliverySlotPicker({
  value,
  onChange,
  baseEtaMins,
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  baseEtaMins?: number;
}) {
  const slots = useMemo(() => buildSlots(baseEtaMins), [baseEtaMins]);
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <div className="text-sm font-bold">Delivery slot</div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Get it ASAP or schedule for later.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {slots.map((s) => {
          const active = (value ?? "asap") === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.iso)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"
              }`}
            >
              {s.id === "asap" ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
