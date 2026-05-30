import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { USE_PHP } from "@/lib/dual-api";
import { php } from "@/lib/php-api";

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    if (USE_PHP) {
      php.checkRole()
        .then((role) => {
          if (!cancelled) setIsAdmin(!!role.isAdmin || !!role.isWarehouseManager);
        })
        .catch(() => {
          if (!cancelled) setIsAdmin(false);
        });
      return () => {
        cancelled = true;
      };
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: authLoading || isAdmin === null };
}
