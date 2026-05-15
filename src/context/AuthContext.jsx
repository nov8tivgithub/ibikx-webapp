import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearAuth, getToken, getUser, setAuth } from '../utils/token';

const AuthContext = createContext(null);

// Auth provider — exposes the current user/token, plus login() / logout() /
// refreshUser() actions. Token storage still goes through utils/token.js so
// MakeAxiosRequest (which lives outside the React tree) keeps working.
export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());

  // Keep state in sync if another tab logs in / out — localStorage events
  // only fire across tabs, so this is a passive sync, not a same-tab one.
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'accesstoken') setToken(e.newValue);
      if (e.key === 'user') {
        try { setUser(e.newValue ? JSON.parse(e.newValue) : null); }
        catch { setUser(null); }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback((payload) => {
    // `payload` is the `data` field of the login API response — it should
    // contain at least `accesstoken`, plus whatever profile fields the
    // backend returns (name, email, etc.).
    const nextToken = payload?.accesstoken || null;
    setAuth({ token: nextToken, user: payload });
    setToken(nextToken);
    setUser(payload);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  // Supports both value and functional updates — `refreshUser(prev => ({ ... }))`
  // is required when multiple concurrent fetches each merge their slice of
  // data, so they don't clobber each other's keys via stale closures.
  const refreshUser = useCallback((nextUserOrFn) => {
    setUser((prev) => {
      const next = typeof nextUserOrFn === 'function' ? nextUserOrFn(prev) : nextUserOrFn;
      setAuth({ token, user: next });
      return next;
    });
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    refreshUser,
  }), [user, token, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
