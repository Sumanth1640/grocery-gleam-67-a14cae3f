import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createAddress, updateAddress } from "@/lib/account.functions";
import { toast } from "sonner";

type AddressType = "Home" | "Work" | "Other";
type AddressRow = {
  id?: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  pincode: string;
  type: AddressType;
  is_default: boolean;
};

const empty: AddressRow = {
  full_name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  pincode: "",
  type: "Home",
  is_default: false,
};

export function AddressDialog({
  open,
  onOpenChange,
  address,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  address?: AddressRow | null;
}) {
  const qc = useQueryClient();
  const createFn = useServerFn(createAddress);
  const updateFn = useServerFn(updateAddress);
  const [form, setForm] = useState<AddressRow>(empty);

  useEffect(() => {
    if (open) setForm(address ? { ...address } : empty);
  }, [open, address]);

  const mut = useMutation({
    mutationFn: async (data: AddressRow) => {
      if (data.id) return updateFn({ data: data as AddressRow & { id: string } });
      const { id: _id, ...rest } = data;
      return createFn({ data: rest });
    },
    onSuccess: () => {
      toast.success(address ? "Address updated" : "Address added");
      qc.invalidateQueries({ queryKey: ["addresses"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = <K extends keyof AddressRow>(k: K, v: AddressRow[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? "Edit address" : "Add new address"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate({
              ...form,
              line2: form.line2?.trim() || null,
            });
          }}
          className="space-y-3"
        >
          <Field label="Full name">
            <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required minLength={2} maxLength={80} className={inputCls} />
          </Field>
          <Field label="Phone (10 digits)">
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              required
              pattern="\d{10}"
              className={inputCls}
              placeholder="9876543210"
            />
          </Field>
          <Field label="Address line 1">
            <input value={form.line1} onChange={(e) => update("line1", e.target.value)} required minLength={3} maxLength={160} className={inputCls} />
          </Field>
          <Field label="Address line 2 (optional)">
            <input value={form.line2 ?? ""} onChange={(e) => update("line2", e.target.value)} maxLength={160} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <input value={form.city} onChange={(e) => update("city", e.target.value)} required minLength={2} maxLength={60} className={inputCls} />
            </Field>
            <Field label="Pincode">
              <input
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                required
                pattern="\d{6}"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Type">
            <div className="flex gap-2">
              {(["Home", "Work", "Other"] as AddressType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => update("type", t)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                    form.type === t ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_default} onChange={(e) => update("is_default", e.target.checked)} className="h-4 w-4 accent-primary" />
            Set as default
          </label>

          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              disabled={mut.isPending}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-pop disabled:opacity-50"
            >
              {mut.isPending ? "Saving…" : address ? "Save changes" : "Add address"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-focus";
