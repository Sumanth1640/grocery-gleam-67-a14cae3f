import { createFileRoute } from "@tanstack/react-router";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminDeleteCoupon, adminListCoupons, adminSaveCoupon } from "@/lib/coupons.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }] }),
  component: CouponsPage,
});

type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: "percent" | "flat";
  discount_value: number;
  min_order: number;
  max_discount: number | null;
  usage_limit: number | null;
  per_user_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
};

const empty: Partial<Coupon> = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  min_order: 0,
  max_discount: null,
  usage_limit: null,
  per_user_limit: 1,
  valid_until: null,
  is_active: true,
};

function CouponsPage() {
  const list = useDualFn(adminListCoupons, (d) => php.admin.listCoupons(d));
  const save = useDualFn(adminSaveCoupon, (d) => php.admin.saveCoupon(d));
  const del = useDualFn(adminDeleteCoupon, (d) => php.admin.deleteCoupon(d));
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-coupons"], queryFn: () => list() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>(empty);

  const saveMut = useMutation({
    mutationFn: (payload: any) => save({ data: payload }),
    onSuccess: () => {
      toast.success("Coupon saved");
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      setOpen(false);
      setForm(empty);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to delete"),
  });

  const openNew = () => {
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (c: Coupon) => {
    setForm({ ...c });
    setOpen(true);
  };

  const submit = () => {
    const payload: any = {
      id: form.id,
      code: (form.code ?? "").trim().toUpperCase(),
      description: form.description ?? "",
      discount_type: form.discount_type ?? "percent",
      discount_value: Number(form.discount_value ?? 0),
      min_order: Number(form.min_order ?? 0),
      max_discount: form.max_discount === null || form.max_discount === undefined || form.max_discount === ("" as any)
        ? null
        : Number(form.max_discount),
      usage_limit: form.usage_limit === null || form.usage_limit === undefined || form.usage_limit === ("" as any)
        ? null
        : Number(form.usage_limit),
      per_user_limit: form.per_user_limit === null || form.per_user_limit === undefined || form.per_user_limit === ("" as any)
        ? null
        : Number(form.per_user_limit),
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      is_active: !!form.is_active,
    };
    saveMut.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Coupons</h2>
          <p className="text-sm text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> New coupon
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No coupons yet.</div>
        ) : (
          <div className="divide-y">
            {data.map((c: any) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{c.code}</span>
                    {c.is_active ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.discount_type === "percent" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                    {c.min_order ? ` · min ₹${c.min_order}` : ""}
                    {c.max_discount ? ` · cap ₹${c.max_discount}` : ""}
                    {c.usage_limit ? ` · used ${c.used_count}/${c.usage_limit}` : ` · used ${c.used_count}`}
                    {c.per_user_limit ? ` · ${c.per_user_limit}/customer` : " · unlimited/customer"}
                    {c.valid_until ? ` · until ${new Date(c.valid_until).toLocaleDateString()}` : ""}
                  </div>
                  {c.description && <div className="mt-1 text-sm">{c.description}</div>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Delete coupon ${c.code}?`)) delMut.mutate(c.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><span /></DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit coupon" : "New coupon"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Code</Label>
              <Input
                value={form.code ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE10"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Input
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="10% off your first order"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select
                  value={form.discount_type ?? "percent"}
                  onValueChange={(v) => setForm((f) => ({ ...f, discount_type: v as any }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={form.discount_value ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Min order (₹)</Label>
                <Input
                  type="number"
                  value={form.min_order ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, min_order: Number(e.target.value) }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Max discount (₹, optional)</Label>
                <Input
                  type="number"
                  value={form.max_discount ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, max_discount: e.target.value === "" ? null : Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Total usage limit (optional)</Label>
                <Input
                  type="number"
                  value={form.usage_limit ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value === "" ? null : Number(e.target.value) }))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Per customer limit</Label>
                <Input
                  type="number"
                  value={form.per_user_limit ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, per_user_limit: e.target.value === "" ? null : Number(e.target.value) }))}
                  placeholder="Unlimited (blank) — 1 = one-time"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Valid until (optional)</Label>
              <Input
                type="date"
                value={form.valid_until ? String(form.valid_until).slice(0, 10) : ""}
                onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value || null }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={!!form.is_active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saveMut.isPending}>
              {saveMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
