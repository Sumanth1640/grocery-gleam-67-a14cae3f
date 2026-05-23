import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldOff, UserPlus, Warehouse as WhIcon, X, Search, Check } from "lucide-react";
import {
  listTeam,
  findUserByEmail,
  grantAdmin,
  revokeAdmin,
  setUserWarehouses,
} from "@/lib/team.functions";

export const Route = createFileRoute("/_authenticated/admin/team")({
  head: () => ({ meta: [{ title: "Team & Roles — Admin" }] }),
  component: TeamPage,
});

type TeamUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  warehouses: Array<{ assignment_id: string; warehouse_id: string; name: string; code: string }>;
};
type Wh = { id: string; name: string; code: string; city: string };

function TeamPage() {
  const qc = useQueryClient();
  const list = useServerFn(listTeam);
  const q = useQuery({ queryKey: ["admin", "team"], queryFn: () => list() });

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TeamUser | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (q.isLoading) {
    return (
      <div className="grid h-40 place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const users: TeamUser[] = q.data?.users ?? [];
  const warehouses: Wh[] = q.data?.warehouses ?? [];
  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (u.email ?? "").toLowerCase().includes(s) ||
      (u.full_name ?? "").toLowerCase().includes(s) ||
      u.warehouses.some((w) => w.name.toLowerCase().includes(s) || w.code.toLowerCase().includes(s))
    );
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "team"] });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Team & Roles</h1>
          <p className="text-xs text-muted-foreground">Grant admin access or assign warehouse managers.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, warehouse"
              className="w-64 rounded-lg border bg-background py-2 pl-7 pr-2 text-sm outline-none focus:ring-focus"
            />
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-pop"
          >
            <UserPlus className="h-4 w-4" /> Add team member
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="grid grid-cols-[1fr_140px_1.4fr_120px] gap-3 border-b bg-secondary/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <div>User</div>
          <div>Role</div>
          <div>Warehouses</div>
          <div className="text-right">Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No team members match.</div>
        ) : (
          filtered.map((u) => (
            <TeamRow key={u.user_id} user={u} onManage={() => setEditing(u)} onChanged={refresh} />
          ))
        )}
      </div>

      {editing && (
        <ManageDialog
          user={editing}
          warehouses={warehouses}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
      {inviteOpen && (
        <InviteDialog
          warehouses={warehouses}
          onClose={() => setInviteOpen(false)}
          onSaved={() => { setInviteOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}

function TeamRow({ user, onManage, onChanged }: { user: TeamUser; onManage: () => void; onChanged: () => void }) {
  const grant = useServerFn(grantAdmin);
  const revoke = useServerFn(revokeAdmin);
  const grantMut = useMutation({
    mutationFn: () => grant({ data: { user_id: user.user_id } }),
    onSuccess: () => { toast.success("Granted admin"); onChanged(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const revokeMut = useMutation({
    mutationFn: () => revoke({ data: { user_id: user.user_id } }),
    onSuccess: () => { toast.success("Revoked admin"); onChanged(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const display = user.full_name || user.email || user.user_id.slice(0, 8);
  return (
    <div className="grid grid-cols-[1fr_140px_1.4fr_120px] items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">{display}</div>
        <div className="truncate text-xs text-muted-foreground">{user.email ?? "—"}</div>
      </div>
      <div>
        {user.is_admin ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
            <ShieldCheck className="h-3 w-3" /> Admin
          </span>
        ) : user.warehouses.length > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">
            <WhIcon className="h-3 w-3" /> Manager
          </span>
        ) : (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">None</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {user.warehouses.length === 0 ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : (
          user.warehouses.map((w) => (
            <span key={w.assignment_id} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold">
              {w.name}
            </span>
          ))
        )}
      </div>
      <div className="flex items-center justify-end gap-1">
        {user.is_admin ? (
          <button
            onClick={() => confirm("Revoke admin role from this user?") && revokeMut.mutate()}
            disabled={revokeMut.isPending}
            title="Revoke admin"
            className="rounded-md border p-1.5 text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <ShieldOff className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={() => grantMut.mutate()}
            disabled={grantMut.isPending}
            title="Grant admin"
            className="rounded-md border p-1.5 text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onManage}
          className="rounded-md border px-2 py-1 text-xs font-semibold hover:bg-secondary"
        >
          Warehouses
        </button>
      </div>
    </div>
  );
}

function ManageDialog({
  user, warehouses, onClose, onSaved,
}: { user: TeamUser; warehouses: Wh[]; onClose: () => void; onSaved: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(user.warehouses.map((w) => w.warehouse_id)),
  );
  const setFn = useServerFn(setUserWarehouses);
  const mut = useMutation({
    mutationFn: () => setFn({ data: { user_id: user.user_id, warehouse_ids: Array.from(selected) } }),
    onSuccess: (res: { added: number; removed: number }) => {
      toast.success(`Updated (${res.added} added, ${res.removed} removed)`);
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <div className="font-display text-lg font-bold">Manage warehouses</div>
            <div className="text-xs text-muted-foreground">{user.full_name || user.email}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[60vh] space-y-1 overflow-y-auto p-3">
          {warehouses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No warehouses yet. Create one in the Warehouses page first.
            </div>
          ) : warehouses.map((w) => {
            const on = selected.has(w.id);
            return (
              <button
                key={w.id}
                onClick={() => toggle(w.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left text-sm hover:bg-secondary/40 ${on ? "border-primary bg-primary/5" : ""}`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>
                  {on && <Check className="h-3 w-3" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-bold">{w.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{w.code} · {w.city || "—"}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 border-t p-3">
          <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm font-semibold">Cancel</button>
          <button
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteDialog({
  warehouses, onClose, onSaved,
}: { warehouses: Wh[]; onClose: () => void; onSaved: () => void }) {
  const [email, setEmail] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const findFn = useServerFn(findUserByEmail);
  const grant = useServerFn(grantAdmin);
  const setFn = useServerFn(setUserWarehouses);

  const mut = useMutation({
    mutationFn: async () => {
      const u = await findFn({ data: { email } });
      if (makeAdmin) await grant({ data: { user_id: u.id } });
      if (selected.size) await setFn({ data: { user_id: u.id, warehouse_ids: Array.from(selected) } });
      return u;
    },
    onSuccess: () => { toast.success("Team member added"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSubmit = email.trim().length > 3 && (makeAdmin || selected.size > 0);
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div className="font-display text-lg font-bold">Add team member</div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-4">
          <label className="block">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">Email of an existing user</div>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@email.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-focus"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">They must have signed up first.</p>
          </label>

          <label className="flex items-center gap-2 rounded-lg border p-2 text-sm">
            <input type="checkbox" checked={makeAdmin} onChange={(e) => setMakeAdmin(e.target.checked)} />
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="font-semibold">Grant full admin access</span>
          </label>

          <div>
            <div className="mb-1 text-xs font-semibold text-muted-foreground">Warehouses to manage</div>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border bg-background p-2">
              {warehouses.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">No warehouses yet.</div>
              ) : warehouses.map((w) => {
                const on = selected.has(w.id);
                return (
                  <button
                    type="button" key={w.id} onClick={() => toggle(w.id)}
                    className={`flex w-full items-center gap-2 rounded-md border p-2 text-left text-sm ${on ? "border-primary bg-primary/5" : ""}`}
                  >
                    <span className={`grid h-4 w-4 place-items-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>
                      {on && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="flex-1 truncate font-semibold">{w.name}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">{w.code}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t p-3">
          <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm font-semibold">Cancel</button>
          <button
            onClick={() => mut.mutate()}
            disabled={!canSubmit || mut.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add
          </button>
        </div>
      </div>
    </div>
  );
}
