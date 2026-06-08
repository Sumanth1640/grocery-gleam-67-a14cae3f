import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { dualApi, USE_PHP } from "@/lib/dual-api";
import { phpAuth, php } from "@/lib/php-api";
import { isAdmin as isAdminFn } from "@/lib/catalog.functions";
import { Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const FONT = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;
const GREEN = "oklch(0.55 0.16 145)";

type Mode = "signin" | "signup";

export function MobileLogin({ redirect }: { redirect: string }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const resolveDest = async (fallback: string) => {
      try {
        const role = USE_PHP ? await php.checkRole() : await isAdminFn();
        if (role?.isAdmin || role?.isWarehouseManager) return "/admin";
      } catch { /* ignore */ }
      return fallback || "/";
    };
    if (USE_PHP) {
      if (phpAuth.get()) {
        void resolveDest(redirect).then((d) => { if (active) navigate({ to: d, replace: true }); });
      }
      return () => { active = false; };
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      const d = await resolveDest(redirect);
      if (active) navigate({ to: d, replace: true });
    });
    return () => { active = false; };
  }, [navigate, redirect]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) { toast.error("Enter your name"); setBusy(false); return; }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error("Invalid email"); setBusy(false); return; }
        if (password.length < 8) { toast.error("Password ≥ 8 chars"); setBusy(false); return; }
        const { error } = await dualApi.signup(email.trim(), password, name.trim());
        if (error) throw error;
        if (USE_PHP) { toast.success("Account created!"); navigate({ to: redirect || "/" }); }
        else toast.success("Account created. Check your email.");
      } else {
        const { error } = await dualApi.signin(email.trim(), password);
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: redirect || "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={FONT}>
      <div
        className="px-6 pt-16 pb-12 text-white"
        style={{ background: `linear-gradient(155deg, ${GREEN}, oklch(0.45 0.18 150))` }}
      >
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Sparkles className="h-6 w-6" strokeWidth={2.4} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold leading-tight">
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-white/85">
          {mode === "signin"
            ? "Sign in to track orders & save addresses."
            : "Order fresh groceries in minutes."}
        </p>
      </div>

      <div className="-mt-6 rounded-t-[2rem] bg-white px-6 pt-7 pb-12">
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <Field label="Full name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="Your name"
              />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@email.com"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Password">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls + " pr-11"}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 disabled:opacity-60"
            style={{ background: GREEN }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secured by hallifresh
        </div>

        <div className="mt-6 text-center text-xs text-zinc-500">
          {mode === "signin" ? (
            <>
              New to HalliFresh?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-extrabold"
                style={{ color: GREEN }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="font-extrabold"
                style={{ color: GREEN }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-2xl border-none bg-zinc-100 px-4 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[oklch(0.55_0.16_145)]/30";
