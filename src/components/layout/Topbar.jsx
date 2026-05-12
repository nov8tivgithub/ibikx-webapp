import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, back = false }) {
  const navigate = useNavigate();
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
        <h1 className="text-lg lg:text-xl font-semibold text-slate-900 truncate">{title}</h1>
      </div>
    </header>
  );
}
