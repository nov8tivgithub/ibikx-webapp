import { useEffect } from 'react';
import { useApi } from './useApi';

// useApi + auto-run once on mount. Pass any positional args via `args`.
// Returns the same { data, loading, error, run, reset } shape as useApi.

export function useApiOnMount(serviceFn, args = []) {
  const api = useApi(serviceFn);

  useEffect(() => {
    api.run(...args);
    // serviceFn / args are intentionally not in the dep list — this is a
    // "run once on mount" helper. For dependent fetches, call api.run() yourself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return api;
}
