import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

/** Reference-style mobile order confirmed modal. */
export function MobileOrderConfirmedDialog({ orderId }: { orderId?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-6 md:hidden">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card p-6 text-center shadow-pop">
        {/* Sun-ray burst */}
        <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-44 w-44">
          <div
            className="h-full w-full opacity-50"
            style={{
              background:
                "conic-gradient(from 0deg, oklch(0.85 0.18 145) 0 8deg, transparent 8deg 30deg, oklch(0.85 0.18 145) 30deg 38deg, transparent 38deg 60deg, oklch(0.85 0.18 145) 60deg 68deg, transparent 68deg 90deg, oklch(0.85 0.18 145) 90deg 98deg, transparent 98deg 120deg, oklch(0.85 0.18 145) 120deg 128deg, transparent 128deg 150deg, oklch(0.85 0.18 145) 150deg 158deg, transparent 158deg 180deg, oklch(0.85 0.18 145) 180deg 188deg, transparent 188deg 210deg, oklch(0.85 0.18 145) 210deg 218deg, transparent 218deg 240deg, oklch(0.85 0.18 145) 240deg 248deg, transparent 248deg 270deg, oklch(0.85 0.18 145) 270deg 278deg, transparent 278deg 300deg, oklch(0.85 0.18 145) 300deg 308deg, transparent 308deg 330deg, oklch(0.85 0.18 145) 330deg 338deg, transparent 338deg 360deg)",
              clipPath: "circle(50%)",
            }}
          />
        </div>

        <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_145)] to-[oklch(0.6_0.18_145)] shadow-pop">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>

        <h2 className="relative mt-6 font-display text-xl font-extrabold">Your order is confirmed!</h2>
        <p className="relative mt-2 text-sm text-muted-foreground">
          Order is accepted, and they are getting it ready.
        </p>

        <div className="relative mt-6 space-y-3">
          {orderId && (
            <Link
              to="/orders/$id"
              params={{ id: orderId }}
              className="block rounded-full border-2 border-[oklch(0.7_0.2_45)] py-3 text-sm font-extrabold text-[oklch(0.7_0.2_45)]"
            >
              Track order
            </Link>
          )}
          <Link
            to="/"
            className="block rounded-full bg-[oklch(0.7_0.2_45)] py-3 text-sm font-extrabold text-white shadow-pop"
          >
            Ok, got it
          </Link>
        </div>
      </div>
    </div>
  );
}
