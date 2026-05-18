import {
  APP_NAME,
  APP_YEAR,
  PRIVACY_URL,
  TERMS_URL,
  POWERED_BY_NAME,
  POWERED_BY_URL,
} from '../../config/constants';

export default function Footer() {
  return (
    <footer className="hidden lg:block border-t border-slate-100 px-8 py-6 text-xs text-slate-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span>&copy; {APP_YEAR} {APP_NAME}</span>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">Privacy</a>
          <a href={TERMS_URL}   target="_blank" rel="noopener noreferrer" className="hover:text-slate-600">Terms</a>
        </div>
        <a
          href={POWERED_BY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-600 transition"
        >
          Powered by <span className="font-semibold">{POWERED_BY_NAME}</span>
        </a>
      </div>
    </footer>
  );
}
