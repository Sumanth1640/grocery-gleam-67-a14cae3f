import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adminListCustomers, adminSetCustomerBlocked, adminSetUserRole } from "@/lib/admin-extra.functions";
import { Loader2, Search, Ban, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const listFn = useServerFn(adminListCustomers);
  const blockFn = useServerFn(adminSetCustomerBlocked);
  const roleFn = useServerFn(adminSetUserRole);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const query = useQuery({ queryKey: ["admin-customers", active], queryFn: () => listFn({ data: { q: active } }) });

  const blockM = useMutation({
    mutationFn: (v: { id: string; is_blocked: boolean }) => blockFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-customers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const roleM = useMutation({
    mutationFn: (v: { user_id: string; role: "admin" | "customer" | "restaurant"; grant: boolean }) => roleFn({ data: v }),
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-customers"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Customers</h2>
        <form onSubmit={(e) => { e.preventDefault(); setActive(q); }} className="flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or phone" className="bg-transparent text-sm outline-none w-64" />
        </form>
      </div>

      {query.isLoading ? (
        <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b"><th className="p-3">Customer</th><th>Orders</th><th>Spent</th><th>Roles</th><th>Status</th><th className="text-right pr-3">Actions</th></tr>
            </thead>
            <tbody>
              {(query.data ?? []).map((c: any) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-semibold">{c.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{c.phone || c.id.slice(0, 8)}</div>
                  </td>
                  <td>{c.orders}</td>
                  <td>₹{c.spent.toLocaleString("en-IN")}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {c.roles.length ? c.roles.map((r: string) => (
                        <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{r}</span>
                      )) : <span className="text-xs text-muted-foreground">user</span>}
                    </div>
                  </td>
                  <td>
                    {c.is_blocked
                      ? <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">Blocked</span>
                      : <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold uppercase text-success">Active</span>}
                  </td>
                  <td className="pr-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => roleM.mutate({ user_id: c.id, role: "admin", grant: !c.roles.includes("admin") })}
                        className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-secondary"
                        title={c.roles.includes("admin") ? "Remove admin" : "Grant admin"}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> {c.roles.includes("admin") ? "Unadmin" : "Admin"}
                      </button>
                      <button
                        onClick={() => roleM.mutate({ user_id: c.id, role: "restaurant", grant: !c.roles.includes("restaurant") })}
                        className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs hover:bg-secondary"
                      >
                        <UserCog className="h-3.5 w-3.5" /> {c.roles.includes("restaurant") ? "Unrestaurant" : "Restaurant"}
                      </button>
                      <button
                        onClick={() => blockM.mutate({ id: c.id, is_blocked: !c.is_blocked })}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${c.is_blocked ? "hover:bg-secondary" : "border-destructive/30 text-destructive hover:bg-destructive/5"}`}
                      >
                        <Ban className="h-3.5 w-3.5" /> {c.is_blocked ? "Unblock" : "Block"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(query.data ?? []).length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
