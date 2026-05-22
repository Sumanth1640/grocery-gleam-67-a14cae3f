import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/lib/use-is-admin";
import { useRouterState, useNavigate } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HalliFresh Veggies — Fresh from Farm to Home" },
      { name: "description", content: "Order fresh farm vegetables, fruits, dairy and household essentials online. Hand-picked daily and delivered to your door." },
      { name: "author", content: "HalliFresh" },
      { property: "og:title", content: "HalliFresh Veggies — Fresh from Farm to Home" },
      { property: "og:description", content: "Fresh from farm to home. Hand-picked produce delivered to your door." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync router={router} />
      <AdminGuard isAdmin={!!isAdmin} />
      <div className="pb-16 md:pb-0">
        <Outlet />
      </div>
      {!isAdmin && <BottomNav />}
      <Toaster />
    </QueryClientProvider>
  );
}

const CUSTOMER_BLOCKED = ["/cart", "/checkout", "/order-success", "/search", "/account", "/wishlist", "/orders", "/c/", "/p/"];

function AdminGuard({ isAdmin }: { isAdmin: boolean }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAdmin) return;
    const blocked =
      path === "/" || CUSTOMER_BLOCKED.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p));
    if (blocked) navigate({ to: "/admin", replace: true });
  }, [isAdmin, path, navigate]);
  return null;
}

function AuthSync({ router }: { router: ReturnType<typeof useRouter> }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        qc.cancelQueries();
        qc.removeQueries({ queryKey: ["admin"] });
        qc.removeQueries({ queryKey: ["admin-stats"] });
        qc.removeQueries({ queryKey: ["is-admin"] });
        navigate({ to: "/login", replace: true });
        return;
      }
      qc.invalidateQueries();
      router.invalidate();
    });
    return () => data.subscription.unsubscribe();
  }, [qc, router, navigate]);
  return null;
}
