import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Initials fallback for the avatar pill when there's no imagelink to show.
function deriveInitials(user) {
  if (!user) return 'DJ';
  const fn = user.first_name || user.firstName;
  const ln = user.last_name  || user.lastName;
  if (fn || ln) {
    return `${(fn?.[0] || '').toUpperCase()}${(ln?.[0] || '').toUpperCase()}` || 'DJ';
  }
  const name = user.name || user.fullname || user.fullName;
  if (typeof name === 'string' && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'DJ';
  }
  return 'DJ';
}

// Best-effort name resolver across the various shapes we've seen in the user
// blob — explicit `name`, first+last, or a "Hi, X 👋"-style title from the
// dashboard userinfo merge.
function resolveDisplayName(user) {
  if (!user) return '';
  if (user.name) return user.name;
  const fn = user.first_name || user.firstName;
  const ln = user.last_name  || user.lastName;
  if (fn || ln) return `${fn || ''} ${ln || ''}`.trim();
  if (user.fullname || user.fullName) return user.fullname || user.fullName;
  if (typeof user.title === 'string') {
    return user.title.replace(/^Hi,\s*/i, '').replace(/[👋\s]+$/, '').trim();
  }
  return '';
}

export default function Topbar({ title, back = false }) {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const imagelink = user?.imagelink;
  const initials  = deriveInitials(user);
  const fullName  = resolveDisplayName(user) || 'Account';
  // The credential line shown under the name. `/myaccount.user.title`
  // (e.g. "AGENT/RYETY") is mirrored to `user.accountTitle` in
  // ProtectedRoute so the dashboard's "Hi, X 👋" greeting (which also
  // lands under `title`) can't clobber it. Falls back to `title` filtered
  // of any "Hi, ..." prefix in case ProtectedRoute hasn't fired yet.
  const accountTitle = (() => {
    if (user?.accountTitle) return user.accountTitle;
    const t = user?.title;
    if (!t) return '';
    if (/^Hi,\s*/i.test(t)) return '';
    return t;
  })();
  const email = user?.email || '';

  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [imagelink]);
  const showImage = !!imagelink && !imgFailed;

  // Dropdown open/close + outside-click + Escape handling.
  const [open, setOpen]           = useState(false);
  const [confirmLogout, setLogoutConfirm] = useState(false);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function doLogout() {
    setLogoutConfirm(false);
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="px-4 lg:px-8 h-16 flex items-center gap-3">
        {back ? (
          <button onClick={() => navigate(-1)} className="-ml-1 p-2 rounded-md hover:bg-slate-100" aria-label="Back">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : (
          <button className="lg:hidden -ml-2 p-2 rounded-md hover:bg-slate-100" aria-label="Open menu">
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {title ? (
          <h1 className="text-lg lg:text-xl font-semibold text-slate-900 truncate flex-1">{title}</h1>
        ) : (
          <span className="flex-1" />
        )}

        {/* Dashboard-supplied menu items — rendered inline before the avatar.
            Sourced from `user.headerMenuList` (the /dashboardnew menuList);
            the Profile page's /myaccount menuList is intentionally NOT used
            here so the two never collide. */}
        {Array.isArray(user?.headerMenuList) && user.headerMenuList.length ? (
          <nav className="hidden sm:flex items-center gap-2 shrink-0 mr-1">
            {user.headerMenuList.map((m) => (
              <a
                key={m.title}
                href={m.key}
                target="_blank"
                rel="noopener noreferrer"
                title={m.desc || m.title}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-800 hover:shadow-soft transition border border-slate-200/70"
                style={{ backgroundColor: m.menuColor || '#ffffff' }}
              >
                {m.iconUrl ? (
                  <img
                    src={m.iconUrl}
                    alt=""
                    className="w-6 h-6 object-contain shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                <span className="hidden md:flex flex-col items-start leading-tight min-w-0">
                  <span className="text-xs lg:text-sm font-semibold truncate max-w-[10rem]">{m.title}</span>
                  {m.desc ? (
                    <span className="text-[10px] lg:text-[11px] text-slate-500 truncate max-w-[10rem]">{m.desc}</span>
                  ) : null}
                </span>
              </a>
            ))}
          </nav>
        ) : null}

        <div ref={wrapRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 ring-2 ring-brand-blue/30 hover:ring-brand-blue/60 transition flex items-center justify-center text-slate-600 font-bold text-sm"
          >
            {showImage ? (
              <img
                src={imagelink}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImgFailed(true)}
              />
            ) : (
              initials
            )}
          </button>

          {open ? (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-soft border border-slate-100 py-2 z-50"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
                {accountTitle ? (
                  <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-brand-blue truncate">
                    {accountTitle}
                  </p>
                ) : null}
                {email ? (
                  <p className="mt-1 text-xs text-slate-500 truncate">{email}</p>
                ) : null}
              </div>

              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 1 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 21a7 7 0 0 1 14 0" />
                </svg>
                Profile
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={() => setLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {confirmLogout ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={() => setLogoutConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h4 className="text-lg font-bold text-slate-900">Sign out?</h4>
            <p className="mt-2 text-sm text-slate-600">You'll need to log in again to access your account.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setLogoutConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="button" onClick={doLogout} className="px-4 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:opacity-90">Logout</button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
