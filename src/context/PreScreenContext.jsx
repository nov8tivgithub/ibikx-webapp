// Global pre-screen overlay (migration doc §2 — Dashboard & Category Management).
//
// Any "main" API response can include:
//   show_pre_screen: "1",
//   pre_screen_data: { prescreen_url, screen_mode, show_close_button, title, ... }
// When that happens the rest of the app needs to show a popup before proceeding.
// This context exposes `show(data)` / `hide()` and renders the popup via the
// PreScreenOverlay component (mounted once in App.jsx). useApi listens via a
// module-level callback registered here so we don't have to wire context into
// every hook caller.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const PreScreenContext = createContext(null);

// Module-level registry — set by the Provider on mount so that non-component
// callers (notably useApi) can trigger the popup without holding a hook ref.
let registeredShow = null;
export function registerPreScreen(showFn) { registeredShow = showFn; }
export function triggerPreScreen(data) {
  if (typeof registeredShow === 'function') registeredShow(data);
}

export function PreScreenProvider({ children }) {
  const [data, setData] = useState(null);

  const show = useCallback((next) => { if (next) setData(next); }, []);
  const hide = useCallback(() => setData(null), []);

  useEffect(() => {
    registerPreScreen(show);
    return () => registerPreScreen(null);
  }, [show]);

  const value = useMemo(() => ({ data, show, hide }), [data, show, hide]);
  return <PreScreenContext.Provider value={value}>{children}</PreScreenContext.Provider>;
}

export function usePreScreen() {
  const ctx = useContext(PreScreenContext);
  if (!ctx) throw new Error('usePreScreen must be used inside <PreScreenProvider>');
  return ctx;
}
