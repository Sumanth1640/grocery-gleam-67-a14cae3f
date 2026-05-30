import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { USE_PHP } from "@/lib/dual-api";
import { phpAuth } from "@/lib/php-api";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    if (USE_PHP) {
      if (!phpAuth.get()) {
        throw redirect({ to: "/login", search: { redirect: location.pathname } });
      }
      return;
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (USE_PHP) {
      if (!phpAuth.get()) {
        navigate({ to: "/login", search: { redirect: window.location.pathname }, replace: true });
        return;
      }
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        navigate({ to: "/login", search: { redirect: window.location.pathname }, replace: true });
        return;
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  return <Outlet />;
}
