import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

// Cheap initials derivation — pulls from common user fields if present, else "DJ".
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

export default function Sidebar({ active }) {
  const { user } = useAuth();
  const imagelink = user?.imagelink;
  const initials  = deriveInitials(user);

  // If the stored imagelink 404s or fails to load, fall back to initials.
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => { setImgFailed(false); }, [imagelink]);
  const showImage = !!imagelink && !imgFailed;

  return (
    <aside className="icon-sidebar fixed top-0 left-0 bottom-0 z-40 flex flex-col py-4">
      <Link to="/dashboard" className="icon-logo" aria-label="Mobilix IdeasCaards">
        <img src="/assets/img/logo.png" alt="" className="h-8 w-auto" />
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
      <Link
        to="/profile"
        className={`icon-link icon-avatar mt-auto ml-2${active === 'profile' ? ' is-active' : ''}`}
      >
        <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0 overflow-hidden">
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
        </span>
        <span className="icon-label">Profile</span>
      </Link>
    </aside>
  );
}
