import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ITEMS = [
  {
    key: 'home',
    to: '/dashboard',
    label: 'Home',
    icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10',
  },
  {
    key: 'favourites',
    to: '/favourites',
    label: 'Favourites',
    icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  {
    key: 'bytes',
    to: '/bytes',
    label: 'Idea Bytes',
    icon: 'M9 18h6m-3-3v3M8.5 14a4 4 0 1 1 7 0c-.7 1-1.5 2-1.5 3h-4c0-1-.8-2-1.5-3z',
  },
  {
    key: 'quiz',
    to: '/quiz',
    label: 'Quiz',
    icon: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7v.5M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
];

export default function Sidebar({ active }) {
  const { logout }                  = useAuth();
  const navigate                    = useNavigate();
  const [confirmLogout, setConfirm] = useState(false);

  function doLogout() {
    setConfirm(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
    <aside className="icon-sidebar fixed top-0 left-0 bottom-0 z-40 flex flex-col py-4">
      <Link to="/dashboard" className="icon-logo" aria-label="Mobilix IdeasCaards">
        <img src={`${import.meta.env.BASE_URL}assets/img/logo.png`} alt="" className="h-8 w-auto" />
      </Link>
      <nav className="flex flex-col gap-1.5 mt-3 px-2">
        {ITEMS.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`icon-link${active === item.key ? ' is-active' : ''}`}
          >
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="icon-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="icon-link mt-auto text-rose-600 hover:text-rose-700"
        aria-label="Logout"
      >
        <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
        </svg>
        <span className="icon-label">Logout</span>
      </button>

    </aside>

    {/* Render the confirm modal through a portal so the sidebar's hover
        backdrop-filter doesn't create a containing block that traps it. */}
    {confirmLogout && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
        onClick={() => setConfirm(false)}
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
            <button type="button" onClick={() => setConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button>
            <button type="button" onClick={doLogout} className="px-4 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:opacity-90">Logout</button>
          </div>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
