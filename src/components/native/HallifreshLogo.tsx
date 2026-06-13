import logoAsset from "@/assets/hallifresh-logo.png.asset.json";

/**
 * HalliFresh logo — official brand mark.
 * Used in the native header and animated splash.
 */
export function HallifreshLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "lg" ? "h-40 w-40" : size === "sm" ? "h-8 w-8" : "h-14 w-14";
  return (
    <img
      src={logoAsset.url}
      alt="HalliFresh"
      className={`${dim} object-contain drop-shadow-sm`}
      draggable={false}
    />
  );
}
