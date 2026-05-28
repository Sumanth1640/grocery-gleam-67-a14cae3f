/**
 * Dual-mode auth hook — works in both Lovable Cloud and PHP modes.
 *
 * In PHP mode it polls localStorage for the JWT (set by dualApi.signin).
 * In Cloud mode it subscribes to Supabase auth state.
 */

import { useEffect, useState } from "react";
import { USE_PHP } from "@/lib/dual-api";
import { phpAuth, php } from "@/lib/php-api";

export type DualUser = { id: string; email: string } | null;

export function useDualAuth(): { user: DualUser; loading: boolean } {
  const [user, setUser] = useState<DualUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (USE_PHP) {
      const token = phpAuth.get();
      if (!token) {
        setLoading(false);
        return;
      }
      php.me()
        .then((u) => {
          if (!cancelled) {
            setUser(u);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            phpAuth.clear();
            setLoading(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    // Lovable Cloud mode
    import("@/integrations/supabase/client").then(({ supabase }) => {
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (cancelled) return;
        const u = session?.user;
        setUser(u ? { id: u.id, email: u.email ?? "" } : null);
        setLoading(false);
      });
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        const u = data.session?.user;
        setUser(u ? { id: u.id, email: u.email ?? "" } : null);
        setLoading(false);
      });
      return () => sub.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, loading };
}
