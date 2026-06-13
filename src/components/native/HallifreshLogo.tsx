/**
 * HalliFresh logo — official brand mark.
 * Served from /public so it works in both the Lovable preview
 * and the static Hostinger build (and the APK WebView).
 */
export function HallifreshLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "lg" ? "h-40 w-40" : size === "sm" ? "h-8 w-8" : "h-14 w-14";
  return (
    <img
      src="/hallifresh-logo.png"
      alt="HalliFresh"
      className={`${dim} object-contain drop-shadow-sm`}
      draggable={false}
    />
  );
}
