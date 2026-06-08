import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import {
  listNotifications,
  markRead,
  deleteNotification,
} from "@/lib/notifications.functions";
import { Bell, Check, CheckCheck, ChevronLeft, Loader2, Package, Sparkles, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

export function MobileNotifications() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useDualFn(listNotifications, () => php.notificationsList());
  const readFn = useDualFn(markRead, (d: any) => php.markNotificationRead(d));
  const delFn = useDualFn(deleteNotification, (d: any) => php.deleteNotification(d.id));

  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => list() });

  const readOne = useMutation({
    mutationFn: (id: string) => readFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notifications-unread"] }); },
  });
  const readAll = useMutation({
    mutationFn: () => readFn({ data: { all: true } }),
    onSuccess: () => {
      toast.success("All marked as read");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notifications-unread"] }); },
  });

  const items = data ?? [];
  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="min-h-screen bg-white pb-32" style={FONT}>
      <header className="sticky top-0 z-30 flex items-center gap-3 bg-white/95 px-5 pt-10 pb-4 backdrop-blur">
        <button
          onClick={() => navigate({ to: "/" })}
          className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-100"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5 text-zinc-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-zinc-900 leading-none">Notifications</h1>
          <p className="mt-1 text-[11px] font-semibold text-zinc-500">{unread} unread</p>
        </div>
        {unread > 0 && (
          <button
            onClick={() => readAll.mutate()}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[11px] font-bold text-white"
            style={{ background: GREEN }}
          >
            <CheckCheck className="h-3 w-3" /> Read all
          </button>
        )}
      </header>

      <div className="px-5 pt-3">
        {isLoading ? (
          <div className="grid h-64 place-items-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
              <Bell className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="mt-4 text-base font-extrabold text-zinc-900">All caught up</p>
            <p className="mt-1 text-xs text-zinc-500">Order updates and offers will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {items.map((n) => {
              const Icon = n.kind === "order" ? Package : n.kind === "offer" ? Tag : Sparkles;
              const inner = (
                <div
                  className={`flex items-start gap-3 rounded-3xl p-4 transition ${
                    n.read ? "bg-zinc-50" : "bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)] ring-1 ring-zinc-100"
                  }`}
                >
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"
                    style={{ background: n.read ? "#a1a1aa" : GREEN }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-extrabold text-zinc-900">{n.title}</div>
                      {!n.read && <span className="h-2 w-2 rounded-full" style={{ background: GREEN }} />}
                    </div>
                    {n.body && <p className="mt-1 text-xs leading-relaxed text-zinc-500">{n.body}</p>}
                    <div className="mt-1.5 text-[10px] font-semibold text-zinc-400">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          readOne.mutate(n.id);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-xl bg-white text-zinc-500"
                        aria-label="Mark read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        del.mutate(n.id);
                      }}
                      className="grid h-8 w-8 place-items-center rounded-xl bg-white text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
              return (
                <li key={n.id}>
                  {n.link ? (
                    <Link to={n.link} onClick={() => !n.read && readOne.mutate(n.id)} className="block">
                      {inner}
                    </Link>
                  ) : (
                    inner
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
