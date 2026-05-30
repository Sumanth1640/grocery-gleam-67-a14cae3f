import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { listAddresses } from "@/lib/account.functions";
import { MapPin, Home as HomeIcon, Check, Plus } from "lucide-react";

export type PickedAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  type: "Home" | "Work" | "Other";
};

export function SavedAddressPicker({
  onPick,
  onAddNew,
  activeSignature,
}: {
  onPick: (a: PickedAddress) => void;
  onAddNew?: () => void;
  /** A serializable signature of the currently-selected address (e.g. "<line1>|<pincode>") to highlight which one is picked. */
  activeSignature?: string;
}) {
  const list = useDualFn(listAddresses, () => php.addresses());
  const { data, isLoading } = useQuery({ queryKey: ["addresses"], queryFn: () => list() });
  const [autoPicked, setAutoPicked] = useState(false);

  useEffect(() => {
    if (autoPicked || !data || data.length === 0) return;
    const def = data.find((a) => a.is_default) ?? data[0];
    onPick({
      fullName: def.full_name,
      phone: def.phone,
      line1: def.line1,
      line2: def.line2,
      city: def.city,
      pincode: def.pincode,
      type: def.type as "Home" | "Work" | "Other",
    });
    setAutoPicked(true);
  }, [data, autoPicked, onPick]);

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-5 rounded-xl border bg-secondary/30 p-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Saved addresses
        </div>
        {onAddNew && (
          <button onClick={onAddNew} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Plus className="h-3 w-3" /> Use new
          </button>
        )}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {data.map((a) => {
          const sig = `${a.line1}|${a.pincode}`;
          const active = activeSignature === sig;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() =>
                  onPick({
                    fullName: a.full_name,
                    phone: a.phone,
                    line1: a.line1,
                    line2: a.line2,
                    city: a.city,
                    pincode: a.pincode,
                    type: a.type as "Home" | "Work" | "Other",
                  })
                }
                className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left transition ${
                  active ? "border-primary bg-primary/5 ring-focus" : "bg-background hover:bg-secondary"
                }`}
              >
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  <HomeIcon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {a.full_name}
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{a.type}</span>
                    {a.is_default && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">Default</span>}
                  </div>
                  <div className="line-clamp-1 text-[11px] text-muted-foreground">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}
                  </div>
                </div>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
