import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getProfileService, getSettingsService } from '../../services/profile.service';
import { notify } from '../../utils/notify';

// SubOption row used in the right-pane detail view. Items from the /settings
// response carry: { title, iconUrl, moduleName, url, menuColor }.
//   moduleName "webPage" → load `url` into the in-page iframe (no new tab).
//   moduleName "settings" / others starting with "/" → in-app Link.
// `onOpenWebview` is invoked for webPage rows so the parent can swap the
// right-pane view to an iframe.
function SubOptionRow({ item, onOpenWebview }) {
  const mod    = (item.moduleName || '').toLowerCase();
  const target = item.url || item.key || '';
  const isHttp = /^https?:/i.test(target);
  const bg     = item.menuColor && item.menuColor !== '#ffffff' ? item.menuColor : '#ffffff';

  const inner = (
    <>
      <span className="w-10 h-10 rounded-full bg-slate-100/70 flex items-center justify-center text-slate-600 overflow-hidden shrink-0">
        {item.iconUrl ? (
          <img
            src={item.iconUrl}
            alt=""
            className="w-6 h-6 object-contain"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
        {item.desc ? <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p> : null}
      </div>
      <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </svg>
    </>
  );
  const cls = 'settings-row flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 hover:border-brand-blue/40 transition mb-3 w-full text-left';
  const style = { background: bg };

  if (mod === 'webpage' || (isHttp && !target.startsWith('/'))) {
    return (
      <button
        type="button"
        onClick={() => onOpenWebview?.({ title: item.title, url: target })}
        className={cls}
        style={style}
      >
        {inner}
      </button>
    );
  }
  // In-app fallback. Defaults to '#' if no destination supplied.
  return <Link to={target || '#'} className={cls} style={style}>{inner}</Link>;
}

export default function Profile() {
  const [copied, setCopied]           = useState(false);
  const [confirmLogout, setConfirm]   = useState(false);
  const [selectedKey, setSelectedKey] = useState('myaccount');
  // `webview` holds the currently-displayed sub-option iframe info:
  //   { title, url }   (e.g. clicking "My Profile" → backend editprofile page)
  // null means the right pane shows the normal profile / sub-options view.
  const [webview, setWebview]         = useState(null);
  const [webviewLoaded, setWebviewLoaded] = useState(false);
  const navigate                      = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const { data, loading, error } = useApiOnMount(getProfileService);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  // Merge data.user into stored user. Skip menuList so the dashboard-supplied
  // header menu isn't replaced. Map image→imagelink, username→name,
  // designation→user_type so other pages see consistent field names.
  useEffect(() => {
    const u = data?.user;
    if (!u || typeof u !== 'object') return;
    const incoming = { ...u };
    if (u.image && !u.imagelink) incoming.imagelink = u.image;
    if (u.username && !u.name)   incoming.name      = u.username;
    if (u.designation && !u.user_type) incoming.user_type = u.designation;
    const merged = { ...(user || {}), ...incoming };
    const same = Object.keys(incoming).every(
      (k) => JSON.stringify(user?.[k]) === JSON.stringify(incoming[k]),
    );
    if (same) return;
    refreshUser(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const u = data?.user || user || {};

  const fullName     = u.username || u.name
                     || `${u.first_name || ''} ${u.last_name || ''}`.trim()
                     || '—';
  const email        = u.email || '';
  const avatarUrl    = u.image || u.imagelink || u.profile_image;
  const initials     = (fullName.match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase() || '?';
  const agentLine    = u.title || (u.agent_code ? `AGENT/${u.agent_code}` : '');

  const showReferral      = u.show_referral_code === '1' || u.show_referral_code === 1;
  const referralCode      = u.referral_code || '';
  const referralLabel     = u.referral_code_label || 'Referral Code:';
  const referralCopyLabel = u.referral_code_copy_label || 'Copied!';

  const expiry       = u.expirydate || u.expiry_date || u.subscription_expiry;
  const expiryStatus = u.expiringon || (u.expiry_days != null ? `Expiring in ${u.expiry_days} day(s)` : '');
  const expiryColor  = u.expirydatecolor || '#0f172a';

  const settingsItems = useMemo(
    () => (Array.isArray(data?.menuList) ? data.menuList : []),
    [data],
  );

  // Pick a sensible default on first load — the first "settings" item the
  // backend returns (e.g. myaccount).
  useEffect(() => {
    if (selectedKey && settingsItems.some((i) => i.key === selectedKey)) return;
    const firstSettings = settingsItems.find((i) => (i.moduleName || '').toLowerCase() === 'settings');
    if (firstSettings) setSelectedKey(firstSettings.key);
  }, [settingsItems, selectedKey]);

  // /settings fetch for the currently-selected settings item.
  const {
    data:    settingsData,
    loading: settingsLoading,
    error:   settingsError,
    run:     runSettings,
  } = useApi(getSettingsService);
  useEffect(() => { if (settingsError) notify.error(settingsError); }, [settingsError]);
  useEffect(() => {
    if (!selectedKey) return;
    // Only fetch /settings for actual settings-module items. webPage items
    // (whose key is a full URL) shouldn't trigger a /settings call.
    const sel = settingsItems.find((i) => i.key === selectedKey);
    if (sel && (sel.moduleName || '').toLowerCase() !== 'settings') return;
    runSettings(selectedKey);
  }, [selectedKey, runSettings, settingsItems]);

  // The /settings response uses `subList` or `items` or `menuList` depending
  // on the endpoint version — accept any of them.
  const subOptions = useMemo(() => {
    const d = settingsData || {};
    return Array.isArray(d.subList)  ? d.subList
         : Array.isArray(d.items)    ? d.items
         : Array.isArray(d.menuList) ? d.menuList
         : Array.isArray(d)          ? d
         : [];
  }, [settingsData]);

  const cert                 = data?.certificate;
  const showCertificates     = cert?.show_certificate === '1' || cert?.show_certificate === 1;
  const showViewCertificates = cert?.show_view_certificates === '1' || cert?.show_view_certificates === 1;
  const certificateData      = Array.isArray(cert?.certificate_data) ? cert.certificate_data : [];

  async function copyReferral() {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  function confirmAndLogout() {
    setConfirm(false);
    logout();
    navigate('/login', { replace: true });
  }

  // Handle a click on a sidebar item. settings + webPage both select the
  // item; webPage also loads its url into the inline iframe immediately.
  // Share / logout still perform their side-effect without selecting.
  function onSidebarItem(item) {
    const mod = (item.moduleName || '').toLowerCase();
    if (mod === 'logout' || /logout|signout|sign\s*out/i.test(item.title || '')) {
      setConfirm(true);
      return;
    }
    if (mod === 'sharetext') {
      const text = item.key || '';
      if (navigator.share) navigator.share({ title: item.title || '', text }).catch(() => {});
      else if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(
        () => notify.success('Share text copied to clipboard'),
        () => notify.error('Unable to copy share text'),
      );
      return;
    }
    // settings or webPage → mark as selected; webPage also opens its iframe.
    setSelectedKey(item.key);
    if (mod === 'webpage') {
      setWebview({ title: item.title || '', url: item.url || item.key || '' });
      setWebviewLoaded(false);
    } else {
      setWebview(null);
    }
  }

  // Open a sub-option's webview in-place instead of a new tab.
  function openWebview(entry) {
    setWebview(entry);
    setWebviewLoaded(false);
  }
  // Closing the webview. If the currently-selected item is a sidebar webPage
  // (e.g. Card Subscription Plans), the selectedKey holds a URL — falling
  // back to that view would be empty, so snap to My Account instead. If the
  // webview was opened from a sub-option, the selectedKey already points at
  // its parent settings item, so we just hide the iframe.
  function closeWebview() {
    setWebview(null);
    const sel = settingsItems.find((i) => i.key === selectedKey);
    if (sel && (sel.moduleName || '').toLowerCase() === 'webpage') {
      setSelectedKey('myaccount');
    }
  }

  const selectedItem = settingsItems.find((i) => i.key === selectedKey);

  // Gate the entire page on /myaccount — no header, no skeleton; just the
  // standard PageSpinner from Layout until the first response lands.
  return (
    <Layout active="profile" title="Profile" loading={!data}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* LEFT — settings nav, ALWAYS visible on the left side, with the
            currently-selected item highlighted. */}
        <aside className="lg:sticky lg:top-4 self-start">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">General Settings</h3>
          <nav className="flex flex-col gap-2">
            {settingsItems.map((item) => {
              const mod      = (item.moduleName || '').toLowerCase();
              const isLogout = mod === 'logout' || /logout|signout|sign\s*out/i.test(item.title || '');
              // Selectable rows: settings + webPage. Both highlight when active.
              const isActive = item.key === selectedKey && (mod === 'settings' || mod === 'webpage');
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onSidebarItem(item)}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition border',
                    isActive
                      ? 'bg-brand-blue text-white border-brand-blue shadow-soft'
                      : 'border-slate-200 hover:border-brand-blue/40 bg-white',
                  ].join(' ')}
                  style={!isActive && item.menuColor && item.menuColor !== '#ffffff' ? { background: item.menuColor } : undefined}
                >
                  <span className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center overflow-hidden shrink-0">
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt=""
                        className="w-5 h-5 object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                  </span>
                  <span className={`text-sm font-semibold flex-1 truncate ${isLogout && !isActive ? 'text-rose-600' : ''}`}>
                    {item.title}
                  </span>
                  {!isLogout ? (
                    <svg className={`w-4 h-4 ${isActive ? 'text-white/80' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT — either the profile header + certificates + sub-options,
            OR an in-place webview with a back button when a webPage row is
            clicked. */}
        <div className="min-w-0">
        {webview ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={closeWebview}
                aria-label="Back"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 hover:border-brand-blue/40 hover:text-brand-blue transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-slate-900 truncate flex-1">{webview.title || 'Settings'}</h3>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white" style={{ height: '70vh' }}>
              {!webviewLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="loader-spinner" aria-hidden="true" />
                </div>
              )}
              <iframe
                src={webview.url}
                title={webview.title || 'Settings'}
                loading="lazy"
                referrerPolicy="no-referrer"
                allow="clipboard-write"
                onLoad={() => setWebviewLoaded(true)}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  border: 0,
                  opacity: webviewLoaded ? 1 : 0,
                  transition: 'opacity 200ms ease',
                }}
              />
            </div>
          </div>
        ) : settingsLoading ? (
          // Right-pane loader during a settings switch (and on first load
          // before the sub-options arrive). Replaces the whole right column
          // with a centred spinner so the transition reads as intentional.
          <div className="flex items-center justify-center py-24">
            <div className="loader-spinner" aria-hidden="true" />
          </div>
        ) : (
        <>
          {selectedKey === 'myaccount' ? (
          <>
          <section className="flex flex-col md:flex-row md:items-center gap-5 pb-5 border-b border-slate-100">
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full ring-[3px] ring-brand-blue overflow-hidden bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-2xl shrink-0">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                : initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-extrabold text-slate-900 truncate">{fullName}</h2>
              {email ? <p className="text-slate-500 truncate">{email}</p> : null}
              {agentLine ? (
                <p className="text-xs font-bold text-slate-700 mt-1 uppercase tracking-wider">{agentLine}</p>
              ) : null}
              {showReferral && referralCode ? (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">{referralLabel}</span>
                  <button onClick={copyReferral} className="inline-flex items-center gap-2 text-brand-blue text-sm font-bold">
                    {copied ? referralCopyLabel : referralCode}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h10v10H9zM5 5h10v4M5 5v10h4" />
                    </svg>
                  </button>
                </div>
              ) : null}
            </div>
            {(expiry || expiryStatus) ? (
              <div className="md:text-right shrink-0">
                <p className="text-xs text-slate-500 font-semibold">Expiry</p>
                {expiry ? <p className="text-sm font-bold text-slate-900">{expiry}</p> : null}
                {expiryStatus ? (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: expiryColor }}>{expiryStatus}</p>
                ) : null}
              </div>
            ) : null}
          </section>


          {cert && showCertificates ? (
            <section className="mt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-bold text-slate-900">{cert.title || 'Certificates'}</h3>
                {showViewCertificates ? (
                  <Link to="/certificates" className="text-sm font-semibold text-brand-blue hover:underline">View Certificates</Link>
                ) : null}
              </div>
              {cert.sub_title ? <p className="text-sm text-slate-500 mt-1">{cert.sub_title}</p> : null}
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {certificateData.map((c, i) => (
                  <img
                    key={c.certificate_uuid || `${c.month}-${c.year}-${i}`}
                    src={c.certificate_image}
                    alt=""
                    className="w-16 h-20 object-contain shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ))}
              </div>
            </section>
          ) : null}
          </>
          ) : null}

          {/* Selected settings item's sub-options — fetched from /settings
              with the selected key. Header uses `cardTitle` from the
              response (e.g. "My Account") with the menuList item title as a
              fallback. Inline spinner while the request is in flight. */}
          <section className="mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">
              {settingsData?.cardTitle || selectedItem?.title || 'Settings'}
            </h3>
            {subOptions.length ? (
              subOptions.map((o) => (
                <SubOptionRow
                  key={o.title || o.url || o.key}
                  item={o}
                  onOpenWebview={openWebview}
                />
              ))
            ) : (
              <p className="text-sm text-slate-500">No options for this section yet.</p>
            )}
          </section>
        </>
        )}
        </div>
      </div>

      {confirmLogout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={() => setConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
          >
            <h4 id="logout-confirm-title" className="text-lg font-bold text-slate-900">Sign out?</h4>
            <p className="mt-2 text-sm text-slate-600">You'll need to log in again to access your account.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndLogout}
                className="px-4 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:opacity-90"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
