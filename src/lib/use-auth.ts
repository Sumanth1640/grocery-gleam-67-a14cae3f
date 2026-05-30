import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { USE_PHP } from "@/lib/dual-api";
import { phpAuth, php } from "@/lib/php-api";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    if (USE_PHP) {
      const hydrate = () => {
        const token = phpAuth.get();
        if (!token) {
          if (!cancelled) setState({ user: null, session: null, loading: false });
          return;
        }
        php.me()
          .then((u) => {
            if (cancelled) return;
            // Cast to satisfy the Supabase User shape consumers rely on (id, email).
            setState({
              user: { id: u.id, email: u.email } as unknown as User,
              session: { access_token: token } as unknown as Session,
              loading: false,
            });
          })
          .catch(() => {
            if (cancelled) return;
            phpAuth.clear();
            setState({ user: null, session: null, loading: false });
          });
      };
      hydrate();
      // Re-check when token changes (login/logout in another tab or same tab)
      const onStorage = (e: StorageEvent) => {
        if (e.key === "php_jwt") hydrate();
      };
      window.addEventListener("storage", onStorage);
      const onFocus = () => hydrate();
      window.addEventListener("focus", onFocus);
      return () => {
        cancelled = true;
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("focus", onFocus);
      };
    }

    // Lovable Cloud mode
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });
    supabase.auth.getSession().then(({ data }) => {
      setState({ user: data.session?.user ?? null, session: data.session, loading: false });
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signOut() {
  if (USE_PHP) {
    phpAuth.clear();
    // Trigger listeners
    window.dispatchEvent(new StorageEvent("storage", { key: "php_jwt" }));
    return;
  }
  await supabase.auth.signOut();
}
