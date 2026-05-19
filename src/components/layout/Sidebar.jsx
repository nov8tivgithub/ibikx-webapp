import { Link } from 'react-router-dom';

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
    icon: 'M12 3a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6V18c0-.8.4-1.5 1-2A7 7 0 0 0 12 3zM9 20h6M10 22h4',
  },
  {
    key: 'quiz',
    to: '/quiz',
    label: 'Quiz',
    icon: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7v.5M12 17h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
];

export default function Sidebar({ active }) {
  return (
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
    </aside>
  );
}
