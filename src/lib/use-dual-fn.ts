/**
 * useDualFn — drop-in replacement for useServerFn that routes through PHP
 * when VITE_USE_PHP=true. Keeps hook order stable.
 *
 * Usage:
 *   const fetch = useDualFn(listAddresses, () => php.addresses());
 *   fetch();              // GET-style
 *   const save = useDualFn(createAddress, (data) => php.addAddress(data));
 *   save({ data: { ... } }); // mutation-style
 */
import { useServerFn } from "@tanstack/react-start";
import { USE_PHP } from "@/lib/dual-api";

export function useDualFn<TCloud extends (...a: unknown[]) => unknown>(
  cloudFn: TCloud,
  phpFn: (data?: unknown) => Promise<unknown>,
): TCloud {
  const c = useServerFn(cloudFn as never) as unknown as TCloud;
  if (USE_PHP) {
    return ((arg?: { data?: unknown }) => phpFn(arg?.data)) as unknown as TCloud;
  }
  return c;
}
