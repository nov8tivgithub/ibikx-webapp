import { Link } from 'react-router-dom';

export default function SettingsRow({ title, subtitle, to = '#', iconPath, external = false }) {
  const Content = (
    <>
      <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {subtitle ? <p className="row-subtitle text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
      </div>
      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </svg>
    </>
  );
  const className =
    'settings-row flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 bg-white hover:border-brand-blue/40 transition mb-3';
  if (external) {
    return (
      <a href={to} className={className}>{Content}</a>
    );
  }
  return (
    <Link to={to} className={className}>{Content}</Link>
  );
}
