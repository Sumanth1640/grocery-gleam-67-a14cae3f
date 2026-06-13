import { Leaf } from "lucide-react";

/**
 * HalliFresh wordmark used in the native header and splash.
 * Swap the icon/text with an uploaded brand asset when ready.
 */
export function HallifreshLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text =
    size === "lg"
      ? "text-4xl"
      : size === "sm"
      ? "text-base"
      : "text-xl";
  const icon =
    size === "lg" ? "h-10 w-10" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const pad = size === "lg" ? "px-5 py-3" : "px-3 py-1.5";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-[oklch(0.55_0.16_145)]/10 ${pad}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Leaf className={`${icon} text-[oklch(0.55_0.16_145)]`} strokeWidth={2.6} />
      <span className={`${text} font-black tracking-tight text-zinc-900`}>
        halli<span className="text-[oklch(0.55_0.16_145)]">fresh</span>
      </span>
    </div>
  );
}
