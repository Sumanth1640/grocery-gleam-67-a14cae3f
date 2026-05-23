import { useEffect, useState } from "react";

/** True only inside a Capacitor native shell (Android/iOS). */
export function useIsNative() {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    import("@capacitor/core")
      .then(({ Capacitor }) => setIsNative(Capacitor.isNativePlatform()))
      .catch(() => setIsNative(false));
  }, []);
  return isNative;
}
