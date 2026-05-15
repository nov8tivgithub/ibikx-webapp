import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardService } from '../../services/catalog.service';
import { getProfileService } from '../../services/profile.service';

// Wraps the protected route group. If the user isn't authenticated, we
// redirect to /login (and remember where they wanted to go via
// `location.state.from`). When they ARE authenticated, this component also
// kicks off the two header-level fetches that drive the Topbar:
//
//   1. /dashboardnew — its `menuList` becomes `user.headerMenuList`
//                      (the pill row of links in the topbar).
//   2. /myaccount    — its `data.user` is merged onto the stored user so
//                      the avatar dropdown shows fresh name/title/email.
//
// Both fire ONCE per mount of the protected outlet, so navigation between
// protected pages doesn't re-trigger them. The individual pages (Dashboard,
// Profile) still do their own fetches for the full UI; this preload just
// guarantees the header is correct before they finish.
export default function ProtectedRoute() {
  const { isAuthenticated, refreshUser } = useAuth();
  const location  = useLocation();
  const firedRef  = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || firedRef.current) return;
    firedRef.current = true;

    // Both fetches use functional refreshUser updates so neither can clobber
    // the other's keys via a stale closure on `user`.

    // 1) /dashboardnew → user.headerMenuList + userinfo merge.
    getDashboardService('videos').then((res) => {
      if (res?.status !== 1 && res?.status !== '1') return;
      const d    = res.data || {};
      const ui   = d.userinfo;
      const list = Array.isArray(d.menuList) ? d.menuList : null;
      if (!ui && !list) return;
      refreshUser((prev) => ({
        ...(prev || {}),
        ...(ui || {}),
        ...(list ? { headerMenuList: list } : {}),
        // Drop any legacy menuList key (older versions wrote here).
        menuList: undefined,
      }));
    });

    // 2) /myaccount → merge data.user into stored user. Aliases image →
    //    imagelink, username → name so the rest of the app reads one field.
    //    `title` (e.g. "AGENT/RYETY") is also copied to `accountTitle` —
    //    /dashboardnew.userinfo.title is a "Hi, X 👋" greeting that lands
    //    under the same key, so the credential line lives on its own field.
    getProfileService().then((res) => {
      if (res?.status !== 1 && res?.status !== '1') return;
      const u = res.data?.user;
      if (!u || typeof u !== 'object') return;
      const incoming = { ...u };
      if (u.image && !u.imagelink) incoming.imagelink = u.image;
      if (u.username && !u.name)   incoming.name      = u.username;
      if (u.title)                  incoming.accountTitle = u.title;
      refreshUser((prev) => ({ ...(prev || {}), ...incoming }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
