import { useCallback, useEffect, useRef, useState } from 'react';
import { triggerPreScreen } from '../context/PreScreenContext';

// Generic { data, loading, error, run, reset } wrapper around any service fn
// that follows the MakeAxiosRequest convention (resolves with { status, data,
// message }). Pass the service function — the hook returns `run` to invoke it.
//
// The hook owns an AbortController that's reset on each `run` call and cleared
// on unmount, so in-flight requests don't update state after the component is gone.
//
// Pre-screen tap: whenever a successful response carries show_pre_screen:"1"
// in its data payload, the registered overlay (PreScreenProvider) is shown.

export function useApi(serviceFn) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const abortRef              = useRef(null);
  const mountedRef            = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const run = useCallback(async (...args) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    const res = await serviceFn(...args, controller.signal);

    if (!mountedRef.current) return res;

    if (res?.status === 1 || res?.status === '1') {
      setData(res.data ?? null);
      // Auto-fire the global pre-screen overlay if the backend asked for it.
      if (
        (res.data?.show_pre_screen === '1' || res.data?.show_pre_screen === 1) &&
        res.data?.pre_screen_data
      ) {
        triggerPreScreen(res.data.pre_screen_data);
      }
    } else if (res?.name === 'CanceledError') {
      // aborted — leave state alone
    } else {
      setError(res?.message || res?.toString?.() || 'Request failed');
    }
    setLoading(false);
    return res;
  }, [serviceFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, run, reset };
}
