import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { webviewUrl } from '../../config/env';

const DEFAULT_SUCCESS = 'Your password reset successfully..';

// Modal that hosts the hosted /forgotpassword webview in an <iframe>. On
// success the hosted page is expected to call:
//   window.parent.postMessage(
//     { source: 'mobilix-forgot-password', success: true, message: '…' },
//     '*'
//   );
// We listen for that message, close the modal, and bubble the success copy
// up via `onSuccess` so the parent can show a toast.
export default function ForgotPasswordModal({ open, onClose, onSuccess }) {
  const src = `${webviewUrl}forgotpassword`;
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  // Reset the loader spinner each time the modal re-opens.
  useEffect(() => {
    if (open) setLoaded(false);
  }, [open]);

  // Cross-origin success message listener.
  useEffect(() => {
    if (!open) return;
    function onMessage(e) {
      const d = e.data;
      if (d && typeof d === 'object' && d.source === 'mobilix-forgot-password' && d.success) {
        onSuccess?.(d.message || DEFAULT_SUCCESS);
        onClose?.();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [open, onClose, onSuccess]);

  // Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Poll the iframe location every 500ms — same-origin loads expose it after
  // the redirect, even when the onLoad fires before the new URL is ready.
  // Cross-origin reads throw and are silently ignored; postMessage handles
  // that path instead.
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      try {
        const win  = iframeRef.current?.contentWindow;
        const href = win?.location?.href;
        if (!href) return;
        const url = new URL(href);
        if (url.searchParams.get('success') === '1') {
          onSuccess?.(url.searchParams.get('message') || DEFAULT_SUCCESS);
          onClose?.();
        }
      } catch {
        /* cross-origin — postMessage path handles it */
      }
    }, 500);
    return () => clearInterval(id);
  }, [open, onClose, onSuccess]);

  function handleIframeLoad() {
    setLoaded(true);
    // Same-origin fallback: if the iframe lands on a URL we can read AND it
    // contains success=1, treat it as success without waiting for postMessage.
    try {
      const win  = iframeRef.current?.contentWindow;
      const href = win?.location?.href;
      if (!href) return;
      const url = new URL(href);
      if (url.searchParams.get('success') === '1') {
        onSuccess?.(url.searchParams.get('message') || DEFAULT_SUCCESS);
        onClose?.();
      }
    } catch {
      /* cross-origin — postMessage path handles it */
    }
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
      >
        <header className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h4 id="forgot-password-title" className="text-base font-bold text-slate-900">Forgot password</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </header>

        <div className="relative bg-white" style={{ height: 'min(60vh, 32rem)' }}>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="loader-spinner" aria-hidden="true" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={src}
            title="Forgot password"
            loading="lazy"
            referrerPolicy="no-referrer"
            allow="clipboard-write"
            onLoad={handleIframeLoad}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              border: 0,
              opacity: loaded ? 1 : 0,
              transition: 'opacity 200ms ease',
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
