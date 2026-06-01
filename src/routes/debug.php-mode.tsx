import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { USE_PHP } from "@/lib/dual-api";
import { php, phpAuth } from "@/lib/php-api";

export const Route = createFileRoute("/debug/php-mode")({
  component: PhpModeDebug,
  head: () => ({ meta: [{ title: "PHP mode health check" }] }),
});

type Status = "idle" | "pending" | "ok" | "fail" | "skip";
type Check = {
  name: string;
  group: "public" | "auth" | "admin" | "partner" | "outlet";
  run: () => Promise<unknown>;
  needsAuth?: boolean;
  needsRole?: "admin" | "partner" | "outlet_mgr";
};

function PhpModeDebug() {
  const [results, setResults] = useState<Record<string, { status: Status; detail?: string }>>({});
  const [running, setRunning] = useState(false);
  const hasToken = !!phpAuth.get();

  const checks: Check[] = [
    // ---- public ----
    { name: "GET /categories/list", group: "public", run: () => php.categories() },
    { name: "GET /products/list", group: "public", run: () => php.products() },
    { name: "GET /banners/list", group: "public", run: () => php.banners() },
    { name: "GET /coupons/list", group: "public", run: () => php.coupons() },
    { name: "GET /restaurants/list", group: "public", run: () => php.restaurants() },
    { name: "GET /search/global?q=test", group: "public", run: () => php.search("test") },

    // ---- auth (current user) ----
    { name: "GET /auth/me", group: "auth", needsAuth: true, run: () => php.me() },
    { name: "GET /auth/check_role", group: "auth", needsAuth: true, run: () => php.checkRole() },
    { name: "GET /addresses/list", group: "auth", needsAuth: true, run: () => php.addresses() },
    { name: "GET /orders/list", group: "auth", needsAuth: true, run: () => php.myOrders() },
    { name: "GET /notifications/list", group: "auth", needsAuth: true, run: () => php.notifications() },
    { name: "GET /wishlist/list", group: "auth", needsAuth: true, run: () => php.wishlist() },
    { name: "GET /coupons/my_usage", group: "auth", needsAuth: true, run: () => php.myCouponUsage() },

    // ---- admin ----
    { name: "GET /admin/stats", group: "admin", needsAuth: true, needsRole: "admin", run: () => php.admin.stats() },
    { name: "GET /admin/orders/list", group: "admin", needsAuth: true, needsRole: "admin", run: () => php.admin.listOrders() },
    { name: "GET /admin/products/list", group: "admin", needsAuth: true, needsRole: "admin", run: () => php.admin.listProducts() },
    { name: "GET /admin/inventory/low_stock", group: "admin", needsAuth: true, needsRole: "admin", run: () => php.admin.lowStock() },

    // ---- partner ----
    { name: "GET /partner/me", group: "partner", needsAuth: true, needsRole: "partner", run: () => php.partner.myRestaurant() },
    { name: "GET /partner/dashboard", group: "partner", needsAuth: true, needsRole: "partner", run: () => php.partner.dashboard() },
    { name: "GET /partner/orders", group: "partner", needsAuth: true, needsRole: "partner", run: () => php.partner.listMyRestaurantOrders() },

    // ---- outlet manager ----
    { name: "GET /outlet_mgr/my_outlets", group: "outlet", needsAuth: true, needsRole: "outlet_mgr", run: () => php.outletMgr.myManagedOutlets() },
    { name: "POST /outlet_mgr/orders_list", group: "outlet", needsAuth: true, needsRole: "outlet_mgr", run: () => php.outletMgr.listOutletOrders() },
  ];

  async function runAll() {
    setRunning(true);
    setResults({});
    for (const c of checks) {
      if (c.needsAuth && !hasToken) {
        setResults((r) => ({ ...r, [c.name]: { status: "skip", detail: "no auth token" } }));
        continue;
      }
      setResults((r) => ({ ...r, [c.name]: { status: "pending" } }));
      try {
        const out = await c.run();
        const detail =
          Array.isArray(out)
            ? `${out.length} item(s)`
            : typeof out === "object" && out
              ? `${Object.keys(out).length} key(s)`
              : String(out);
        setResults((r) => ({ ...r, [c.name]: { status: "ok", detail } }));
      } catch (e) {
        setResults((r) => ({
          ...r,
          [c.name]: { status: "fail", detail: e instanceof Error ? e.message : String(e) },
        }));
      }
    }
    setRunning(false);
  }

  useEffect(() => {
    if (USE_PHP) void runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups: Check["group"][] = ["public", "auth", "admin", "partner", "outlet"];
  const summary = Object.values(results).reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<Status, number>,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">PHP mode health check</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mode: <span className="font-mono">{USE_PHP ? "PHP" : "CLOUD"}</span> · Token:{" "}
        <span className="font-mono">{hasToken ? "present" : "absent"}</span> · Base:{" "}
        <span className="font-mono">
          {(import.meta.env.VITE_PHP_API_BASE as string) || "(auto)"}
        </span>
      </p>

      {!USE_PHP && (
        <div className="mt-4 rounded-md border border-yellow-400/40 bg-yellow-50 p-3 text-sm text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          PHP mode is off. Build with <code>VITE_USE_PHP=true</code> and{" "}
          <code>VITE_PHP_API_BASE=https://yourdomain.com/api</code> to enable, then reload this page.
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={runAll}
          disabled={running}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {running ? "Running…" : "Run checks"}
        </button>
        <span className="text-sm text-muted-foreground">
          ok: {summary.ok ?? 0} · fail: {summary.fail ?? 0} · skip: {summary.skip ?? 0} · pending:{" "}
          {summary.pending ?? 0}
        </span>
      </div>

      {groups.map((g) => {
        const items = checks.filter((c) => c.group === g);
        return (
          <section key={g} className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {g}
            </h2>
            <ul className="mt-2 divide-y rounded-md border">
              {items.map((c) => {
                const r = results[c.name] ?? { status: "idle" as Status };
                const color =
                  r.status === "ok"
                    ? "text-green-600"
                    : r.status === "fail"
                      ? "text-red-600"
                      : r.status === "skip"
                        ? "text-yellow-600"
                        : r.status === "pending"
                          ? "text-blue-600"
                          : "text-muted-foreground";
                return (
                  <li key={c.name} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-mono text-xs">{c.name}</div>
                      {c.needsRole && (
                        <div className="text-[10px] text-muted-foreground">
                          requires role: {c.needsRole}
                        </div>
                      )}
                      {r.detail && (
                        <div className="mt-0.5 truncate text-xs text-muted-foreground" title={r.detail}>
                          {r.detail}
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 font-mono text-xs uppercase ${color}`}>
                      {r.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="mt-6 text-xs text-muted-foreground">
        Auth-gated checks are skipped if no <code>php_jwt</code> token is in localStorage. Role-gated
        checks return a permission error if the logged-in user lacks that role — that's expected.
      </p>
    </div>
  );
}
