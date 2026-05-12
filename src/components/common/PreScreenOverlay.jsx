import { useEffect } from 'react';
import { usePreScreen } from '../../context/PreScreenContext';

// One overlay mounted at the app root. Renders nothing until something calls
// preScreen.show(data) (auto-triggered by useApi when a response sets
// show_pre_screen:"1"). screen_mode controls the size: "quarter" is a
// centered card; everything else (including "full") is near-fullscreen.

export default function PreScreenOverlay() {
  const { data, hide } = usePreScreen();

  // Lock body scroll while the overlay is open so wheel events outside the
  // card don't move the underlying page.
  useEffect(() => {
    if (!data) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [data]);

  if (!data) return null;

  const quarter   = data.screen_mode === 'quarter';
  const showClose = data.show_close_button === '1' || data.show_close_button === 1;
  const url       = data.prescreen_url;
  const title     = data.title;

  // Backdrop click closes the overlay only when the close button is allowed.
  function onBackdropClick(e) {
    if (e.target === e.currentTarget && showClose) hide();
  }

  return (
    <div
      onClick={onBackdropClick}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm"
    >
      <div
        className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
          quarter
            ? 'w-full max-w-md h-[90vh]'
            : 'w-full h-full max-w-5xl max-h-[95vh]'
        }`}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-slate-100 shrink-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{title || ''}</p>
            {showClose && (
              <button
                type="button"
                onClick={hide}
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            )}
          </div>
        )}
        {url ? (
          <iframe
            src={url}
            title={title || 'Pre-screen'}
            className="flex-1 w-full border-0"
            allow="clipboard-write"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            (no pre-screen URL)
          </div>
        )}
      </div>
    </div>
  );
}
