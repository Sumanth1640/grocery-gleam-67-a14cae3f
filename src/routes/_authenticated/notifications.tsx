import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { BottomNav } from "@/components/site/BottomNav";
import {
  listNotifications,
  markRead,
  deleteNotification,
} from "@/lib/notifications.functions";
import { Bell, Check, CheckCheck, Loader2, Package, Tag, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useIsNative } from "@/lib/use-native";
import { MobileNotifications } from "@/components/native/MobileNotifications";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — hallifresh" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const isNative = useIsNative();
  if (isNative) return <MobileNotifications />;
  return <WebNotificationsPage />;
}

function WebNotificationsPage() {
  const qc = useQueryClient();
  const list = useDualFn(listNotifications, () => php.notificationsList());
  const readFn = useDualFn(markRead, (d: any) => php.markNotificationRead(d));
  const delFn = useDualFn(deleteNotification, (d: any) => php.deleteNotification(d.id));

  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: () => list() });

  const readOne = useMutation({
    mutationFn: (id: string) => readFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notifications", "unread"] }); qc.invalidateQueries({ queryKey: ["notifications-unread"] }); },
  });
  const readAll = useMutation({
    mutationFn: () => readFn({ data: { all: true } }),
    onSuccess: () => {
      toast.success("All marked as read");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); qc.invalidateQueries({ queryKey: ["notifications", "unread"] }); qc.invalidateQueries({ queryKey: ["notifications-unread"] }); },
  });

  const items = data ?? [];
  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Notifications</h1>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          {unread > 0 && (
            <button
              onClick={() => readAll.mutate()}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold hover:bg-secondary"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="mt-10 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-lg font-bold">You're all caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">Order updates and offers will show up here.</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-2">
            {items.map((n) => {
              const Icon = n.kind === "order" ? Package : n.kind === "offer" ? Tag : Sparkles;
              const inner = (
                <div className={`flex items-start gap-3 rounded-2xl border p-4 transition ${n.read ? "bg-card" : "border-primary/30 bg-primary/5"}`}>
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${n.read ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold">{n.title}</div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                    <div className="mt-1 text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {!n.read && (
                      <button
                        onClick={(e) => { e.preventDefault(); readOne.mutate(n.id); }}
                        className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-secondary"
                        aria-label="Mark read"
                        title="Mark read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); del.mutate(n.id); }}
                      className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
      <Footer />
      <BottomNav />
    </div>
  );
}
