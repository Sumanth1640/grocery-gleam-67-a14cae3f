import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDualFn } from "@/lib/use-dual-fn";
import { php } from "@/lib/php-api";
import { myRestaurant } from "@/lib/partner.functions";
import { AlertCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react";

const STEPS = ["Basics", "Documents", "Menu", "Agreement", "Submit"];

export function OnboardingBanner() {
  const fn = useServerFn(myRestaurant);
  const q = useQuery({ queryKey: ["my-restaurant"], queryFn: () => fn() });
  const r = q.data;
  if (!r) return null;

  const step = Math.min(Math.max(r.onboarding_step ?? 1, 1), 5);
  const pct = Math.round(((step - 1) / 5) * 100);

  if (r.status === "approved" && r.agreement_accepted_at) {
    return null; // fully live, hide banner
  }

  if (r.status === "pending" && step >= 5) {
    return (
      <div className="border-b bg-blue-500/5 text-blue-700 dark:text-blue-300">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <div className="flex-1">
            <b>Application under review.</b> We'll notify you once approved — usually within 24h.
          </div>
        </div>
      </div>
    );
  }

  if (r.status === "rejected") {
    return (
      <div className="border-b bg-destructive/10 text-destructive">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <div className="flex-1">
            <b>Application rejected.</b> {r.rejection_reason ?? "Please review and resubmit."}
          </div>
          <Link to="/partner/profile" className="inline-flex items-center gap-1 rounded-lg bg-destructive px-2.5 py-1 text-[11px] font-bold text-destructive-foreground">
            Fix & resubmit <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  // In-progress onboarding
  const currentLabel = STEPS[Math.min(step - 1, STEPS.length - 1)];
  return (
    <div className="border-b bg-primary/5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" /> Setup {pct}%
        </div>
        <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15 sm:block">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-muted-foreground">
          Next: <b className="text-foreground">Step {step} · {currentLabel}</b>
        </div>
        <Link to="/partner/profile" className="ml-auto inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
          Continue setup <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
