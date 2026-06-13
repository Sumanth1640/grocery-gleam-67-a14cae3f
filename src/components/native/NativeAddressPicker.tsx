import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, MapPin, Plus, Check, Home as HomeIcon, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dualApi } from "@/lib/dual-api";
import { useAuth } from "@/lib/use-auth";
import {
  useDeliveryAddress,
  setDeliveryAddress,
  type DeliveryAddress,
} from "@/lib/delivery-address-store";
import { AddressDialog } from "@/components/site/AddressDialog";

/**
 * Native-styled delivery-address picker for the mobile home header.
 * Renders the "Deliver to <city>" pill plus a slide-up sheet to pick
 * a saved address.
 */
export function NativeAddressPicker() {
  const { user } = useAuth();
  const addr = useDeliveryAddress();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery<any[]>({
    queryKey: ["addresses"],
    queryFn: () => dualApi.listAddresses() as Promise<any[]>,
    enabled: !!user && open,
  });

  const top = addr ? addr.type : "DELIVER TO";
  const bottom = addr ? `${addr.line1}, ${addr.city}` : "Bengaluru, India";
  const activeSig = addr ? `${addr.line1}|${addr.pincode}` : null;

  const pick = (a: any) => {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-left"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[oklch(0.55_0.16_145)]/10 text-[oklch(0.55_0.16_145)]">
          <MapPin className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 leading-none mb-1">
            {top}
          </p>
          <p className="flex items-center gap-1 text-xs font-extrabold text-zinc-900 truncate max-w-[200px]">
            {bottom}
            <ChevronDown
              className="h-3 w-3 text-[oklch(0.55_0.16_145)]"
              strokeWidth={2.5}
            />
          </p>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-[2rem] bg-white shadow-2xl animate-slide-in-right" style={{ animationName: "fade-in" }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-display text-lg font-extrabold text-zinc-900">
                Choose delivery address
              </h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-2 overflow-y-auto px-5 pb-3">
              {!user ? (
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm">
                  <p className="text-zinc-600">
                    Sign in to save and pick delivery addresses.
                  </p>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-block rounded-xl bg-[oklch(0.55_0.16_145)] px-4 py-2 text-xs font-bold text-white"
                  >
                    Sign in
                  </Link>
                </div>
              ) : isLoading ? (
                <div className="py-10 text-center text-xs text-zinc-400">Loading…</div>
              ) : !data || data.length === 0 ? (
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-sm text-zinc-600">
                  No saved addresses yet.
                </div>
              ) : (
                data.map((a) => {
                  const sig = `${a.line1}|${a.pincode}`;
                  const active = activeSig === sig;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => pick(a)}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-[oklch(0.55_0.16_145)] bg-[oklch(0.55_0.16_145)]/5"
                          : "border-zinc-100 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-600">
                        <HomeIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm font-extrabold text-zinc-900">
                          <span className="truncate">{a.full_name}</span>
                          <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-zinc-600">
                            {a.type}
                          </span>
                          {a.is_default && (
                            <span className="rounded-full bg-[oklch(0.55_0.16_145)]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[oklch(0.55_0.16_145)]">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="line-clamp-2 text-[11px] font-medium text-zinc-500">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}, {a.city} — {a.pincode}
                        </div>
                      </div>
                      {active && (
                        <Check className="h-4 w-4 shrink-0 text-[oklch(0.55_0.16_145)]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-zinc-100 px-5 py-3">
              {user && (
                <button
                  onClick={() => {
                    setOpen(false);
                    setAddOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[oklch(0.55_0.16_145)] py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-100"
                >
                  <Plus className="h-4 w-4" /> Add new address
                </button>
              )}
              {addr && (
                <button
                  onClick={() => {
                    setDeliveryAddress(null);
                    setOpen(false);
                  }}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 py-2.5 text-xs font-bold text-zinc-500"
                >
                  Clear selected address
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
