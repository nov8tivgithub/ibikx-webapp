import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function PopularBytesSlider({ items = [] }) {
  const trackRef = useRef(null);
  const visible  = items.slice(0, 5);

  if (!visible.length) return null;

  function scrollBy(dir) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-popular-card]');
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section className="col-span-full bg-slate-50 rounded-2xl border border-slate-100 p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-900">Popular Bytes</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {visible.map((it) => {
          const key = it.byteskey || it.key || it.id;
          const desc = typeof it.description === 'string'
            ? it.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
            : '';
          const trimmed = desc.length > 120 ? `${desc.slice(0, 120)}...` : desc;
          return (
            <Link
              key={it.id || key || it.title}
              data-popular-card
              to={`/bytes/${encodeURIComponent(key || '')}/details`}
              className="snap-start shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-soft"
            >
              {it.image_path ? (
                <div className="aspect-[16/9] bg-slate-200">
                  <img
                    src={it.image_path}
                    alt={it.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              ) : null}
              <div className="p-3">
                <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{it.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-tight line-clamp-3">{trimmed}</p>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                  <span className="truncate">{it.date}</span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-8 10.5-8 10.5 8 10.5 8-4 8-10.5 8S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {it.total_views ?? 0}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
