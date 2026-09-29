"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

/**
 * Filters live in the URL so results are shareable and the server does the
 * querying. The page passes its current params in as props — rather than
 * reading them with `useSearchParams`, which would force a Suspense boundary —
 * and this returns a setter that merges a patch and navigates.
 *
 * Empty strings and empty arrays remove the param. Changing any filter other
 * than `page` resets pagination.
 */
export function useQueryState(current: Record<string, string | undefined>) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const set = useCallback(
    (patch: Record<string, string | string[] | undefined>) => {
      const next = new URLSearchParams();
      const merged: Record<string, string | string[] | undefined> = {
        ...current,
        page: undefined,
        ...patch,
      };
      for (const [k, v] of Object.entries(merged)) {
        const value = Array.isArray(v) ? v.join(",") : v;
        if (value) next.set(k, value);
      }
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [current, pathname, router],
  );

  return { set, pending };
}
