import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { webviewUrl } from '../../config/env';

// When the hosted webview finishes its flow, it navigates to a URL with
// `?success=1` (and typically a `message` query param / DOM message).
// Two completion paths are wired here:
//
//  1. The webview page can call:
//       window.parent.postMessage(
//         { source: 'mobilix-forgot-password', success: true, message: '…' },
//         '*'
//       );
//     The parent listens and routes to /login with the message.
//
//  2. Fallback: every iframe load, we try to read the iframe's location.
//     If same-origin (dev with proxy or future same-host deploy) and we see
//     `?success=1`, we route to /login using the `message` query param (or a
//     default copy). On cross-origin pages this access throws — silently
//     ignored, leaving postMessage as the contract.
const DEFAULT_SUCCESS = 'Your password reset successfully..';

export default function ForgotPassword() {
  const src = `${webviewUrl}forgotpassword`;
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);
  const navigate  = useNavigate();

  // Cross-origin path — webview posts back to us when it lands on success.
  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (d && typeof d === 'object' && d.source === 'mobilix-forgot-password' && d.success) {
        navigate('/login', {
          replace: true,
          state: { successMessage: d.message || DEFAULT_SUCCESS },
        });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  function handleIframeLoad() {
    setLoaded(true);
    // Same-origin best-effort check. Throws cross-origin → that's fine, the
    // postMessage path above is the real contract.
    try {
      const win = iframeRef.current?.contentWindow;
      const href = win?.location?.href;
      if (!href) return;
      const url = new URL(href);
      if (url.searchParams.get('success') === '1') {
        navigate('/login', {
          replace: true,
          state: { successMessage: url.searchParams.get('message') || DEFAULT_SUCCESS },
        });
      }
    } catch {
      /* cross-origin — rely on postMessage */
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <section className="bg-brand-gradient text-white px-6 py-10 lg:px-16 lg:py-16 lg:w-1/2 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
        <div className="relative max-w-md">
          <img src={`${import.meta.env.BASE_URL}assets/img/logo.png`} alt="Mobilix IdeasCaards" className="h-28 lg:h-40 mx-auto" />
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mt-10">Reset Password</h2>
          <p className="mt-3 text-white/85 text-base lg:text-lg">Follow the steps on the right to reset your password.</p>
        </div>
      </section>
      <section className="bg-white flex-1 lg:w-1/2 min-h-[60vh] lg:min-h-screen flex flex-col items-center justify-center px-6 py-8 lg:px-16">
        <div className="w-full max-w-md mb-3 flex">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>
        </div>
        <div className="relative w-full max-w-md" style={{ height: '70vh' }}>
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="loader-spinner" />
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
      </section>
    </div>
  );
}
