import { Link } from 'react-router-dom';

export default function ByteListItem({
  title, image, time, views, shares, excerpt, sourceLogo, sourceName,
  to = '/bytes',
}) {
  const trimmedExcerpt = typeof excerpt === 'string' && excerpt.length > 157
    ? `${excerpt.slice(0, 157)}...`
    : excerpt;
  return (
    <Link to={to} className="block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-soft h-full">
      {image ? (
        <div className="aspect-[16/9] bg-slate-200">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      ) : null}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold overflow-hidden">
            {sourceLogo
              ? <img src={sourceLogo} alt={sourceName || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              : 'm'}
          </span>
          <span className="text-xs text-slate-500 truncate">{time}</span>
          <span className="ml-auto flex items-center gap-3 text-xs text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-8 10.5-8 10.5 8 10.5 8-4 8-10.5 8S1.5 12 1.5 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {views}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
              </svg>
              {shares}
            </span>
          </span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">{title}</h3>
        <p className="text-sm text-slate-600 mt-1 min-h-[2.5rem] leading-tight">{trimmedExcerpt}</p>
      </div>
    </Link>
  );
}
