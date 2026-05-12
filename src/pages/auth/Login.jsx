import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { loginService } from '../../services/auth.service';
import { notify } from '../../utils/notify';

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail]   = useState('');
  const [password, setPwd]  = useState('');
  // Per-field errors. `email` slot holds either a client-side "required"
  // message OR the server's response message (whichever was last set).
  const [errors, setErrors] = useState({ email: null, password: null });
  // Tracks the submit lifecycle independent of useApi's loading flag so the
  // button is guaranteed to re-enable the instant the response lands, even
  // before any subsequent setState / navigate calls run.
  const [submitting, setSubmitting] = useState(false);
  const navigate            = useNavigate();
  const location            = useLocation();
  const { login }           = useAuth();
  const { run }             = useApi(loginService);
  // If ProtectedRoute kicked us here, location.state.from is the page the
  // user originally tried to visit; send them back there after login.
  const from = location.state?.from?.pathname || '/dashboard';

  function validate() {
    const next = { email: null, password: null };
    if (!email.trim())    next.email    = 'Email is required.';
    if (!password.trim()) next.password = 'Password is required.';
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (submitting) return;            // guard against double-submit
    const v = validate();
    if (v.email || v.password) {
      setErrors(v);
      return;
    }
    setErrors({ email: null, password: null });
    setSubmitting(true);

    let res;
    try {
      res = await run(email, password);
    } finally {
      setSubmitting(false);            // ← re-enables Sign In before any branch runs
    }

    if (res?.status === 1 || res?.status === '1') {
      login(res.data);
      notify.success(res.message || 'Welcome back');
      navigate(from, { replace: true });
    } else {
      setErrors({
        email: res?.message || 'Unable to sign in. Please try again.',
        password: null,
      });
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
          <img src="/assets/img/logo.png" alt="Mobilix IdeasCaards" className="h-28 lg:h-40 mx-auto" />
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight mt-12">Log In To Your Account</h2>
          <p className="mt-3 text-white/85 text-base lg:text-lg">Enter your email and password to login.</p>
          <p className="hidden lg:block text-sm text-white/70 mt-12">
            Build your brand through daily customer interaction with insurance-themed cards and videos.
          </p>
        </div>
      </section>
      <section className="bg-white flex-1 px-6 py-8 lg:px-16 lg:py-16 lg:w-1/2 flex items-center">
        <form className="w-full max-w-md mx-auto space-y-5" onSubmit={onSubmit} noValidate>
          {/* Email */}
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Email</span>
            <div className="relative mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: null })); }}
                aria-invalid={!!errors.email}
                aria-describedby="login-email-error"
                className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? 'border-red-400 focus:ring-red-300/40'
                    : 'border-slate-200 focus:ring-brand-blue/30'
                }`}
                placeholder="Email"
              />
              {/* Absolute so the input wrapper height never changes; fades in
                  via opacity. Sits in the space-y-5 gap below. */}
              <p
                id="login-email-error"
                aria-live="polite"
                className={`pointer-events-none absolute left-0 right-0 top-full mt-1 text-xs text-red-500 leading-tight transition-opacity duration-150 ${
                  errors.email ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {errors.email || ' '}
              </p>
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span className="text-sm font-medium text-slate-500">Password</span>
            <div className="relative mt-1">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPwd(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: null })); }}
                aria-invalid={!!errors.password}
                aria-describedby="login-password-error"
                className={`w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 pr-11 transition-colors ${
                  errors.password
                    ? 'border-red-400 focus:ring-red-300/40'
                    : 'border-slate-200 focus:ring-brand-blue/30'
                }`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-8 10.5-8 10.5 8 10.5 8-4 8-10.5 8S1.5 12 1.5 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              <p
                id="login-password-error"
                aria-live="polite"
                className={`pointer-events-none absolute left-0 right-0 top-full mt-1 text-xs text-red-500 leading-tight transition-opacity duration-150 ${
                  errors.password ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {errors.password || ' '}
              </p>
            </div>
          </label>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-brand-blue hover:underline">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-gradient-r text-white text-base font-semibold rounded-xl py-3 shadow-soft hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-slate-500">
            New to Ideascaards?{' '}
            <Link to="/signup" className="font-bold text-brand-blue hover:underline">Join now</Link>
          </p>
        </form>
      </section>
    </div>
  );
}
