import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

type FilterUpdates = Record<string, string | null | undefined>;

export function useURLFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setFilters = useCallback(
    (updates: FilterUpdates, options?: { resetPage?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      if (options?.resetPage !== false) {
        params.delete("page");
      }

      startTransition(() => {
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const clearFilters = useCallback(
    (keys: string[]) => {
      const updates: FilterUpdates = {};
      for (const key of keys) updates[key] = null;
      setFilters(updates);
    },
    [setFilters],
  );

  const getFilter = useCallback(
    (key: string) => searchParams.get(key) ?? undefined,
    [searchParams],
  );

  return { setFilters, clearFilters, getFilter, isPending };
}
