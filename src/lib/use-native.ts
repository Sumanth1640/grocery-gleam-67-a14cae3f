import { useEffect, useState } from "react";

/**
 * Returns true when the app is running inside a Capacitor native shell
 * (Android/iOS), false in a regular browser. Use this to conditionally
 * hide web-only chrome (e.g. install banners) or enable native features
 * (haptics, status-bar tinting, etc.).
 */
export function useIsNative() {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    // dynamic import keeps Capacitor out of SSR
    import("@capacitor/core")
      .then(({ Capacitor }) => setIsNative(Capacitor.isNativePlatform()))
      .catch(() => setIsNative(false));
  }, []);
  return isNative;
}
