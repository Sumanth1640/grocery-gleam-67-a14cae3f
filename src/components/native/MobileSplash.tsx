import { useEffect, useState } from "react";
import { HallifreshLogo } from "./HallifreshLogo";

/**
 * Animated splash overlay shown on first app launch. Fades out after ~1.6s.
 * The animation uses tailwind keyframes (fade-in + scale-in) plus a pulse
 * ring for a polished entry.
 */
export function MobileSplash() {
  const [show, setShow] = useState(true);
  const [out, setOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 1400);
    const t2 = setTimeout(() => setShow(false), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] grid place-items-center bg-gradient-to-b from-[oklch(0.97_0.04_145)] to-white transition-opacity duration-500 ${
        out ? "opacity-0" : "opacity-100"
      }`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="relative flex flex-col items-center">
        {/* Pulse rings */}
        <span className="absolute h-40 w-40 rounded-full bg-[oklch(0.55_0.16_145)]/20 animate-ping" />
        <span className="absolute h-28 w-28 rounded-full bg-[oklch(0.55_0.16_145)]/30 animate-pulse" />

        <div className="relative animate-scale-in">
          <HallifreshLogo size="lg" />
        </div>

        <p className="mt-6 animate-fade-in text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
          Fresh • Fast • Yours
        </p>
      </div>
    </div>
  );
}
