/**
 * useDualFn — drop-in replacement for useServerFn that routes through PHP
 * when VITE_USE_PHP=true. Keeps hook order stable.
 *
 * Returns a callable typed the same as the cloud server function so callers
 * keep existing types (params + return).
 */
import { useServerFn } from "@tanstack/react-start";
import { USE_PHP } from "@/lib/dual-api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDualFn<TCloud extends (...args: any[]) => any>(
  cloudFn: TCloud,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  phpFn: (data?: any) => Promise<any>,
): TCloud {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = useServerFn(cloudFn as any) as unknown as TCloud;
  if (USE_PHP) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((arg?: any) => phpFn(arg?.data)) as unknown as TCloud;
  }
  return c;
}
