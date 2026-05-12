import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import SettingsRow from '../../components/common/SettingsRow';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../../utils/notify';

export default function Profile() {
  const [copied, setCopied] = useState(false);
  const navigate            = useNavigate();
  const { user, logout }    = useAuth();

  // Pull display data from the merged user payload (login + dashboard userinfo).
  const fullName  = user?.name
                  || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
                  || user?.title?.replace(/^Hi,\s*/, '').replace(/[👋\s]+$/, '')
                  || 'David John';
  const email        = user?.email || 'test100@icwares.com';
  const agentLine    = user?.agent_code ? `AGENT/${user.agent_code}` : (user?.lic_code ? `AGENT/${user.lic_code}` : 'AGENT/—');
  const initials     = (fullName.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || 'DJ';
  const avatarUrl    = user?.imagelink || user?.profile_image;
  const referralCode = user?.referral_code || user?.referralcode || '53AA6D';
  const expiry       = user?.expiry_date || user?.subscription_expiry;
  const expiryDays   = user?.expiry_days ?? user?.subscription_days_left;

  async function copyReferral() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }
  function onLogout() {
    logout();
    notify.success('Signed out');
    navigate('/login', { replace: true });
  }
  return (
    <Layout active="profile" title="Profile">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4 text-left">
          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full ring-4 ring-brand-blue/40 overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-2xl shrink-0">
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              : initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-slate-500">{email}</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">{agentLine}</p>
          </div>
        </div>
        <div className="md:text-right space-y-3 shrink-0">
          <div className="flex md:justify-end items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Referral Code:</span>
            <button onClick={copyReferral} className="inline-flex items-center gap-2 text-brand-blue font-bold">
              {copied ? 'Copied!' : referralCode}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h10v10H9zM5 5h10v4M5 5v10h4" />
              </svg>
            </button>
          </div>
          {(expiry || expiryDays != null) && (
            <div className="flex md:justify-end items-baseline gap-3">
              <span className="text-sm font-semibold text-slate-700">Expiry:</span>
              <div>
                {expiry ? <p className="font-bold text-slate-900">{expiry}</p> : null}
                {expiryDays != null ? <p className="text-xs text-slate-500">Expiring in {expiryDays} day(s)</p> : null}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-xl font-bold text-slate-900">Certificates</h3>
          <a href="/certificates" className="text-sm font-semibold text-brand-blue hover:underline">View Certificates</a>
        </div>
        <p className="text-sm text-slate-500">You have 0 certificates</p>
        <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <img
              key={i}
              src={`${import.meta.env.BASE_URL}assets/img/certificate-placeholder.jpg`}
              alt=""
              className="w-16 h-20 object-contain shrink-0 opacity-70"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">General Settings</h3>
        <SettingsRow title="My Account" subtitle="Manage your account here" to="/account" iconPath="M16 14a4 4 0 1 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM5 21a7 7 0 0 1 14 0" />
        <SettingsRow title="Card Subscription Plans" subtitle="Manage your subscriptions" to="/card-subscriptions" iconPath="M3 7h18v10H3zM7 11h10M7 14h6" />
        <SettingsRow title="Video Subscription Plans" subtitle="Remaining Credits: 9" to="/video-subscriptions" iconPath="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
        <SettingsRow title="Refer & Earn" to="/refer-and-earn" iconPath="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <SettingsRow title="Wallet" subtitle="Balance 0 pts" to="/wallet" iconPath="M3 7h18a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h14M16 12h2" />
        <SettingsRow title="About" subtitle="Know more about us" to="/about" iconPath="M12 8v4M12 16h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" />
        <SettingsRow title="Share App" subtitle="Share with your dear ones" external to="#" iconPath="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
        <button
          type="button"
          onClick={onLogout}
          className="settings-row w-full text-left flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition mb-3"
        >
          <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </span>
          <p className="text-sm font-semibold text-slate-900">Logout</p>
        </button>
      </section>
    </Layout>
  );
}
