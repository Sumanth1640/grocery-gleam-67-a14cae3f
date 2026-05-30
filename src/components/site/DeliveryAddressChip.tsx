import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, ChevronDown, Plus, Check, Home as HomeIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dualApi } from "@/lib/dual-api";
import { useAuth } from "@/lib/use-auth";
import { useDeliveryAddress, setDeliveryAddress, type DeliveryAddress } from "@/lib/delivery-address-store";
import { AddressDialog } from "@/components/site/AddressDialog";

export function DeliveryAddressChip({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const addr = useDeliveryAddress();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["addresses"],
    queryFn: () => dualApi.listAddresses() as Promise<any[]>,
    enabled: !!user && open,
  });

  const label = addr
    ? { top: addr.type, bottom: `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}, ${addr.city}` }
    : { top: "Deliver to", bottom: "Set your location" };

  const pick = (a: NonNullable<typeof data>[number]) => {
    const next: DeliveryAddress = {
      fullName: a.full_name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      pincode: a.pincode,
      type: a.type as DeliveryAddress["type"],
    };
    setDeliveryAddress(next);
    setOpen(false);
  };

  const activeSig = addr ? `${addr.line1}|${addr.pincode}` : null;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center gap-1 rounded-xl border bg-secondary/50 px-3 py-2 text-left text-xs hover:bg-secondary ${className}`}
            aria-label="Choose delivery address"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <div className="min-w-0 max-w-[160px]">
              <div className="truncate font-semibold">{label.top}</div>
              <div className="truncate text-muted-foreground">{label.bottom}</div>
            </div>
            <ChevronDown className="ml-1 h-4 w-4 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Deliver to
            </div>
            {user && (
              <button
                onClick={() => {
                  setOpen(false);
                  setAddOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add new
              </button>
            )}
          </div>

          {!user ? (
            <div className="rounded-xl border bg-secondary/30 p-3 text-sm">
              <p className="text-muted-foreground">
                Sign in to save and pick delivery addresses.
              </p>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                Sign in
              </Link>
            </div>
          ) : isLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Loading…</div>
          ) : !data || data.length === 0 ? (
            <div className="rounded-xl border bg-secondary/30 p-3 text-sm">
              <p className="text-muted-foreground">No saved addresses yet.</p>
              <button
                onClick={() => {
                  setOpen(false);
                  setAddOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
              >
                <Plus className="h-3 w-3" /> Add address
              </button>
            </div>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {data.map((a) => {
                const sig = `${a.line1}|${a.pincode}`;
                const active = activeSig === sig;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => pick(a)}
                      className={`flex w-full items-start gap-2 rounded-xl border p-2.5 text-left transition ${
                        active ? "border-primary bg-primary/5" : "hover:bg-secondary"
                      }`}
                    >
                      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                        <HomeIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <span className="truncate">{a.full_name}</span>
                          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                            {a.type}
                          </span>
                          {a.is_default && (
                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="line-clamp-2 text-[11px] text-muted-foreground">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}
                        </div>
                      </div>
                      {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {addr && (
            <button
              onClick={() => {
                setDeliveryAddress(null);
                setOpen(false);
              }}
              className="mt-3 w-full rounded-lg border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Clear selected address
            </button>
          )}
        </PopoverContent>
      </Popover>

      <AddressDialog
        open={addOpen}
        onOpenChange={(v) => {
          setAddOpen(v);
          if (!v) refetch();
        }}
      />
    </>
  );
}
