import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export type UserRole = "admin" | "customer" | "restaurant" | "rider" | null;

export function useUserRoles() {
  const { user, loading } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setRoles([]); setDone(true); return; }
    let cancelled = false;
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      if (cancelled) return;
      setRoles((data ?? []).map((r) => r.role as UserRole));
      setDone(true);
    });
    return () => { cancelled = true; };
  }, [user, loading]);

  return { roles, loading: loading || !done, isRider: roles.includes("rider"), isAdmin: roles.includes("admin") };
}
