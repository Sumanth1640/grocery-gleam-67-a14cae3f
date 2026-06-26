import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

import { dualApi, USE_PHP } from "@/lib/dual-api";
import { phpAuth, php } from "@/lib/php-api";
import { isAdmin as isAdminFn } from "@/lib/catalog.functions";

import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { useIsNative } from "@/lib/use-native";
import { MobileLogin } from "@/components/native/MobileLogin";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional().default("/"),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Sign in — HalliFresh" }] }),
  component: LoginPage,
});

type Mode = "signin" | "signup";

function LoginPage() {
  const { redirect } = useSearch({ from: "/login" });
  const isNative = useIsNative();
  if (isNative) return <MobileLogin redirect={redirect} />;
  return <WebLoginPage redirect={redirect} />;
}

function WebLoginPage({ redirect }: { redirect: string }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  // If already logged in, bounce out
  useEffect(() => {
    let active = true;
    if (USE_PHP) {
      if (phpAuth.get()) {
        void resolvePostLoginDest(redirect).then((dest) => {
          if (active) navigate({ to: dest, replace: true });
        });
      }
      return () => {
        active = false;
      };
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      const dest = await resolvePostLoginDest(redirect);
      if (active) navigate({ to: dest, replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate, redirect]);

  const resolvePostLoginDest = async (fallback: string): Promise<string> => {
    try {
      const role = USE_PHP ? await php.checkRole() : await isAdminFn();
      if (role?.isAdmin) return "/admin";
      if (role?.isWarehouseManager) return "/admin";
    } catch {
      // ignore — fall back to requested redirect
    }
    return fallback || "/";
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        if (name.trim().length < 2) {
          toast.error("Please enter your name");
          setBusy(false);
          return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
          toast.error("Please enter a valid email address");
          setBusy(false);
          return;
        }
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setBusy(false);
          return;
        }
        const { error } = await dualApi.signup(email.trim(), password, name.trim());
        if (error) throw error;
        if (USE_PHP) {
          toast.success("Account created!");
          navigate({ to: redirect || "/" });
        } else {
          toast.success("Account created. Check your email to confirm.");
        }
      } else {
        const { error } = await dualApi.signin(email.trim(), password);
        if (error) throw error;
        toast.success("Welcome back!");
        const dest = await resolvePostLoginDest(redirect);
        navigate({ to: dest });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-md place-items-center px-4 py-10">
        <div className="w-full rounded-3xl border bg-card p-6 shadow-card md:p-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-pop">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-xl font-extrabold leading-none">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {mode === "signin" ? "Sign in to track orders & save addresses" : "Order in 11 minutes — get started"}
              </div>
            </div>
          </div>

          <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or {mode === "signin" ? "sign in with email" : "sign up with email"} <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Jane Doe" />
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
                  className={inputCls + " pr-10"}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-pop transition disabled:opacity-60 hover:opacity-95"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                New to HalliFresh?{" "}
                <button onClick={() => setMode("signup")} className="font-bold text-primary hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="font-bold text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-6 text-center text-[11px] text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/" className="underline">terms</Link> and{" "}
            <Link to="/" className="underline">privacy policy</Link>.
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}


const inputCls =
  "w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-focus";
