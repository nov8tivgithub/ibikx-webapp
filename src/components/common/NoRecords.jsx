// Empty-state shared between the dashboard carousel and any list page that
// returns zero items (Favourites, Subcategory, etc.). Renders a soft SVG
// illustration plus a centred message.
export default function NoRecords({ message = 'No Records Found' }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <svg className="w-40 h-40 text-brand-blue" fill="none" viewBox="0 0 200 200" aria-hidden="true">
        <rect x="42"  y="40"  width="86" height="100" rx="6" stroke="currentColor" strokeWidth="3" fill="white" transform="rotate(-7 85 90)" />
        <rect x="78"  y="60"  width="86" height="100" rx="6" stroke="currentColor" strokeWidth="3" fill="white" />
        <circle cx="100" cy="92" r="8" fill="currentColor" opacity="0.18" />
        <path d="M82 132 L106 110 L124 124 L142 110 L160 132 Z" fill="currentColor" opacity="0.18" />
        <path d="M30 110 h22 M28 130 h28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
        <path d="M170 80 h22 M168 100 h28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <p className="mt-4 text-xl font-bold text-slate-900">{message}</p>
    </div>
  );
}
