import { useEffect, useState } from "react";

/**
 * True inside a Capacitor native shell (Android/iOS).
 *
 * Dev override for previewing the native UI in a browser:
 *   - Add `?native=1` to the URL (persists via localStorage)
 *   - Remove with `?native=0`
 */
export function useIsNative() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Dev override via query string / localStorage
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("native");
      if (q === "1") localStorage.setItem("force-native", "1");
      else if (q === "0") localStorage.removeItem("force-native");
      if (localStorage.getItem("force-native") === "1") {
        setIsNative(true);
        return;
      }
    } catch {
      // ignore
    }

    import("@capacitor/core")
      .then(({ Capacitor }) => setIsNative(Capacitor.isNativePlatform()))
      .catch(() => setIsNative(false));
  }, []);

  return isNative;
}
