import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationUrl } from '../../config/constants';
import { notify } from '../../utils/notify';

// Host + path hints used to recognise the post-registration redirect — keyed
// off the env-supplied registration URL so the detection logic moves with
// the registration page itself if it's ever rehosted.
const REGISTRATION_HOST = (() => {
  try { return new URL(registrationUrl).hostname; } catch { return ''; }
})();
// The registration redirect chain currently lands on one of:
//   /razorpay/completed?type=…              (always indicates success)
//   /razorpay/success?fromregister=1        (legacy path, also used by payment
//                                            success — so gate strictly on
//                                            ?fromregister=1)
const SUCCESS_PATHS = ['/razorpay/completed', '/razorpay/success'];
function isSuccessUrl(url) {
  if (!url) return false;
  if (url.pathname.includes('/razorpay/completed')) return true;
  if (url.pathname.includes('/razorpay/success') && url.searchParams.get('fromregister') === '1') return true;
  return false;
}
const DEFAULT_SUCCESS   = 'Thank you\nYour registration is successful.';

// The signup form is hosted on the backend and embedded as an iframe. On
// successful registration the hosted page redirects to:
//   https://…/manage/dev/razorpay/success?fromregister=1
// When we detect that landing URL we send the user to /login with a success
// toast. Detection is dual-channel — same-origin polling (works when the
// React app is deployed on the same host as the iframe) plus a postMessage
// fallback for cross-origin contexts. Mirrors the ForgotPasswordModal flow.
export default function Signup() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // Resolve a success and bounce to /login with a toast.
  function handleSuccess(message) {
    notify.success(message || DEFAULT_SUCCESS);
    navigate('/login', { replace: true });
  }

  // Cross-origin postMessage channel — hosted page can opt in with:
  //   window.parent.postMessage(
  //     { source: 'mobilix-register', success: true, message: '…' }, '*'
  //   );
  useEffect(() => {
    function onMessage(e) {
      const d = e.data;
      if (d && typeof d === 'object' && d.source === 'mobilix-register' && d.success) {
        handleSuccess(d.message);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same-origin polling — reads the iframe's contentWindow.location every
  // 500ms. Cross-origin reads throw and are silently ignored.
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const win  = iframeRef.current?.contentWindow;
        const href = win?.location?.href;
        if (!href) return;
        const url = new URL(href);
        if (url.hostname === REGISTRATION_HOST && isSuccessUrl(url)) {
          handleSuccess(url.searchParams.get('message'));
        }
      } catch {
        /* cross-origin — postMessage path covers it */
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same-origin onLoad fallback so we don't wait the full 500ms after the
  // success page lands.
  function handleIframeLoad() {
    try {
      const win  = iframeRef.current?.contentWindow;
      const href = win?.location?.href;
      if (!href) return;
      const url = new URL(href);
      if (url.hostname === REGISTRATION_HOST && isSuccessUrl(url)) {
        handleSuccess(url.searchParams.get('message'));
      }
    } catch {
      /* cross-origin — postMessage path covers it */
    }
  }

  return (
    <iframe
      ref={iframeRef}
      src={registrationUrl}
      title="Online registration"
      loading="lazy"
      referrerPolicy="no-referrer"
      allow="clipboard-write"
      onLoad={handleIframeLoad}
      style={{ display: 'block', width: '100%', height: '100vh', border: 0 }}
    />
  );
}
