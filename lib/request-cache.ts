import "server-only";

import { cache } from "react";

/**
 * Per-request memoization for server-component data getters.
 *
 * `React.cache` memoizes by argument identity, which never matches for object
 * literals built at each call site. Keying by JSON preserves the structural
 * per-request dedup that the shared query client used to provide, so e.g.
 * `generateMetadata` and the page body calling the same getter with the same
 * input hit the database once.
 */
export function cacheByInput<TInput, TOutput>(
  fn: (input: TInput) => Promise<TOutput>,
) {
  const cached = cache((key: string) => fn(JSON.parse(key) as TInput));

  return (input: TInput) => cached(JSON.stringify(input));
}
