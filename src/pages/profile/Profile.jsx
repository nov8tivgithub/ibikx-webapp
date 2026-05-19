import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getProfileService, getSettingsService } from '../../services/profile.service';
import { getWalletService } from '../../services/wallet.service';
import { notify } from '../../utils/notify';

// Selecting a sidebar item normally fires /settings with its key. A few
// special keys instead trigger their own endpoint (e.g. referandearn fetches
// the referral list via /wallet). Keyed by the item's `key` (lowercased).
const SPECIAL_SETTINGS_KEYS = {
  referandearn: (run) => run({ type: 'referral', page_id: 1 }),
};

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

// One stat tile inside the wallet hero: icon chip on the left, label + value
// stacked on the right, with a small upward sparkline tucked under the value
// to echo the "earnings trending up" theme from the design.
function StatCard({ icon, iconClass, label, value, sparkClass = 'text-slate-300' }) {
  return (
    <div className="rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/70 px-3 py-2.5 flex items-center gap-3 min-w-0">
      <span className={`w-9 h-9 shrink-0 rounded-full text-white flex items-center justify-center shadow-soft ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-xl font-extrabold text-slate-900 leading-none">
            {value}
            <span className="ml-1 text-[11px] font-bold text-slate-400 align-baseline">pts</span>
          </p>
          <svg viewBox="0 0 60 18" className={`w-10 h-4 shrink-0 ${sparkClass}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 14 L14 9 L24 12 L36 4 L48 7 L58 2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Renders the /wallet response (wallet_summary + history_types tab strip +
// history list) inline in the Profile right pane. Matches the mobile app
// "Wallet" screen — gradient hero with a wallet illustration, two stat cards
// for Total Earned / Balance, a pill tab strip for the active history type,
// and the per-entry list (or "No Records Found." empty state).
//
// `onChangeType(type)` is invoked when the user picks a different history
// tab so the parent can refetch /wallet with the new `type` parameter.
function WalletPane({ data, title, onChangeType, loading = false }) {
  const summary       = data?.wallet_summary || {};
  // API response misspells "wallet" as "walllet" — accept both spellings.
  const showSummary   = (data?.show_walllet_summary ?? data?.show_wallet_summary) === '1'
                     || (data?.show_walllet_summary ?? data?.show_wallet_summary) === 1;
  const showTabs      = data?.show_wallet_tabs === '1' || data?.show_wallet_tabs === 1;
  const tabs          = Array.isArray(data?.history_types) ? data.history_types : [];
  const history       = Array.isArray(data?.history) ? data.history : [];

  // Track the active tab optimistically so the highlight flips the moment
  // the user clicks, even before the refetched response lands.
  const dataActiveType = data?.type
                      || tabs.find((t) => t.is_active === '1' || t.is_active === 1)?.type
                      || tabs[0]?.type;
  const [activeType, setActiveType] = useState(dataActiveType);
  useEffect(() => { if (dataActiveType) setActiveType(dataActiveType); }, [dataActiveType]);
  function onTabClick(t) {
    if (t === activeType) return;
    setActiveType(t);
    onChangeType?.(t);
  }

  const totalLabel    = summary.total_points_earned_label || 'Total Points Earned';
  const totalValue    = summary.total_points_earned ?? 0;
  const balanceLabel  = summary.balance_points_label || 'Balance Wallet Points';
  const balanceValue  = summary.balance_points ?? 0;

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>

      {/* Hero — title + subtitle on the left, stat cards in a row below,
          wallet illustration anchored to the right edge. */}
      <div className="relative rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-sky-100 via-indigo-50 to-white">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />

        <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 sm:gap-6 px-5 sm:px-6 py-5 items-center">
          <div className="min-w-0">
            <h4 className="text-lg font-extrabold text-slate-900 leading-tight">{title} Overview</h4>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Track your points, rewards and earnings</p>

            {showSummary ? (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <StatCard
                  label={totalLabel}
                  value={totalValue}
                  iconClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
                  sparkClass="text-emerald-500"
                  icon={(
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.6l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.77l-5.9 3 1.13-6.57L2.45 9.54l6.6-.96L12 2.6z" />
                    </svg>
                  )}
                />
                <StatCard
                  label={balanceLabel}
                  value={balanceValue}
                  iconClass="bg-gradient-to-br from-sky-400 to-brand-blue"
                  sparkClass="text-sky-500"
                  icon={(
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                />
              </div>
            ) : null}
          </div>

          <div className="hidden sm:flex justify-end items-center shrink-0">
            <img
              src={`${import.meta.env.BASE_URL}assets/img/wallet-hero.png`}
              alt=""
              aria-hidden="true"
              className="w-36 h-36 lg:w-44 lg:h-44 object-contain drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      {showTabs && tabs.length ? (
        <div className="mt-5 inline-flex bg-slate-200 rounded-full p-1 shadow-soft w-full">
          {tabs.map((t) => {
            const active = t.type === activeType;
            return (
              <button
                key={t.type}
                type="button"
                onClick={() => onTabClick(t.type)}
                className={[
                  'flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition',
                  active ? 'bg-brand-blue text-white shadow-soft' : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* History list / empty state. Only this section is replaced by a
          spinner during a tab-switch refetch — the hero and tab strip stay
          mounted so the user keeps their context. */}
      <div className="relative mt-5 min-h-[8rem]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl z-10">
            <div className="loader-spinner" aria-hidden="true" />
          </div>
        ) : null}
        {history.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
            {history.map((row, i) => (
              <div
                key={row.id || row.uuid || `${row.title}-${i}`}
                className={`flex items-center gap-3 px-4 py-3 ${i ? 'border-t border-slate-100' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {row.title || row.name || row.username || '—'}
                  </p>
                  {row.subtitle || row.date ? (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{row.subtitle || row.date}</p>
                  ) : null}
                </div>
                {row.amount || row.points ? (
                  <p className="text-sm font-bold text-emerald-600">{row.amount || row.points}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-lg font-medium">
            No Records Found.
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  const [copied, setCopied]           = useState(false);
  const [confirmLogout, setConfirm]   = useState(false);
  const navigate                      = useNavigate();
  // The active settings pane is identified in the URL by the menuList item's
  // `type` field (`/settings/<type>`). Internally we still pass the item's
  // `key` to the /settings API — `type` is the URL-facing identifier, `key`
  // is the API-facing one.
  const { settingType }               = useParams();
  const selectedType                  = settingType || '';
  const setSelectedType = (type) => {
    navigate(type ? `/settings/${encodeURIComponent(type)}` : '/settings');
  };
  // `webview` holds the currently-displayed sub-option iframe info:
  //   { title, url }   (e.g. clicking "My Profile" → backend editprofile page)
  // null means the right pane shows the normal profile / sub-options view.
  const [webview, setWebview]         = useState(null);
  const [webviewLoaded, setWebviewLoaded] = useState(false);
  // Bumped to force a fresh iframe mount (e.g. when the embedded page signals
  // it has finished and we want to reload back to the original start URL).
  const [webviewReloadKey, setWebviewReloadKey] = useState(0);
  const webviewRef                    = useRef(null);
  useEffect(() => { webviewRef.current = webview; }, [webview]);
  const { user, logout, refreshUser } = useAuth();

  // Embedded pages (e.g. the Razorpay /razorpay/completed redirect) signal
  // they're done by posting { type: 'mobilix:webview-complete' } to the
  // parent window. We respond by reloading the iframe to the URL it was
  // originally opened with — webview.url stays at the start URL even after
  // inner navigation, so bumping the key is enough to force a remount.
  useEffect(() => {
    function onMessage(ev) {
      const d = ev.data;
      if (!d || typeof d !== 'object' || d.type !== 'mobilix:webview-complete') return;
      const current = webviewRef.current;
      if (!current?.url) return;
      // Only trust messages from the iframe's own origin.
      try {
        if (ev.origin !== new URL(current.url).origin) return;
      } catch { return; }
      setWebviewLoaded(false);
      setWebviewReloadKey((k) => k + 1);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

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

  // Pick a sensible default on first load — the first menulist item, so the
  // URL always carries a concrete type. Non-selectable rows (logout / share)
  // are skipped so the right pane has something to show.
  useEffect(() => {
    if (selectedType && settingsItems.some((i) => (i.type || i.key) === selectedType)) return;
    const first = settingsItems.find((i) => {
      const m = (i.moduleName || '').toLowerCase();
      return m === 'settings' || m === 'webpage';
    });
    const t = first?.type || first?.key;
    if (t) setSelectedType(t);
  }, [settingsItems, selectedType]);

  // /settings fetch for the currently-selected settings item.
  const {
    data:    settingsData,
    loading: settingsLoading,
    error:   settingsError,
    run:     runSettings,
  } = useApi(getSettingsService);
  useEffect(() => { if (settingsError) notify.error(settingsError); }, [settingsError]);

  // Some sidebar keys (e.g. referandearn) skip the /settings fetch entirely
  // and call a dedicated endpoint instead. /wallet is one such case — the
  // referral list is hosted there, not under /settings.
  const {
    data:    walletData,
    loading: walletLoading,
    error:   walletError,
    run:     runWallet,
  } = useApi(getWalletService);
  useEffect(() => { if (walletError) notify.error(walletError); }, [walletError]);

  useEffect(() => {
    if (!selectedType) return;
    const sel = settingsItems.find((i) => (i.type || i.key) === selectedType);
    if (!sel) return;
    // webPage sidebar items: skip /settings and open their iframe directly.
    // Keeps deep-links like /settings/cardsubscription rendering the same
    // webview the sidebar click would have produced.
    if ((sel.moduleName || '').toLowerCase() === 'webpage') {
      setWebview({ title: sel.title || '', url: sel.url || sel.key || '' });
      setWebviewLoaded(false);
      return;
    }
    // Non-webPage sidebar item — make sure any previously-open iframe is hidden.
    setWebview(null);
    const apiKey  = sel.key || '';
    const special = SPECIAL_SETTINGS_KEYS[apiKey.toLowerCase?.()];
    if (special) { special(runWallet); return; }
    runSettings(apiKey);
  }, [selectedType, runSettings, runWallet, settingsItems]);

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
    // settings or webPage → mark as selected. The selectedType effect below
    // takes care of opening the iframe for webPage items.
    setSelectedType(item.type || item.key);
  }

  // Open a sub-option's webview in-place instead of a new tab.
  function openWebview(entry) {
    setWebview(entry);
    setWebviewLoaded(false);
  }
  // Closing the webview. If the currently-selected item is a sidebar webPage
  // the URL points at its type but there's no sub-options pane to fall back
  // to, so snap to the first selectable item instead. Sub-option webviews
  // already have the parent settings item selected, so we just hide the iframe.
  function closeWebview() {
    setWebview(null);
    const sel = settingsItems.find((i) => (i.type || i.key) === selectedType);
    if (sel && (sel.moduleName || '').toLowerCase() === 'webpage') {
      const first = settingsItems.find((i) => (i.moduleName || '').toLowerCase() === 'settings');
      const t = first?.type || first?.key;
      if (t) setSelectedType(t);
    }
  }

  const selectedItem = settingsItems.find((i) => (i.type || i.key) === selectedType);
  const selectedKey  = selectedItem?.key || '';

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
              const itemType = item.type || item.key;
              // Selectable rows: settings + webPage. Both highlight when active.
              const isActive = itemType === selectedType && (mod === 'settings' || mod === 'webpage');
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
                  <span className="flex-1 min-w-0">
                    <span className={`block text-sm font-semibold truncate ${isLogout && !isActive ? 'text-rose-600' : ''}`}>
                      {item.title}
                    </span>
                    {item.desc ? (
                      <span className={`block text-xs truncate ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                        {item.desc}
                      </span>
                    ) : null}
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
              {/* Back button only when the webview was opened from a sub-option.
                  For a main sidebar webPage item the sidebar itself is the way
                  back, so the arrow would be confusing. */}
              {(selectedItem?.moduleName || '').toLowerCase() !== 'webpage' && (
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
              )}
              <h3 className="text-lg font-bold text-slate-900 truncate flex-1">{webview.title || 'Settings'}</h3>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white" style={{ height: '70vh' }}>
              {!webviewLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="loader-spinner" aria-hidden="true" />
                </div>
              )}
              <iframe
                key={webviewReloadKey}
                src={webview.url}
                title={webview.title || 'Settings'}
                // referrerPolicy intentionally NOT set to no-referrer — some
                // hosted pages (notably the Razorpay payment webview) check
                // the Referer header before allowing the request and bounce
                // back to the registration page when it's stripped.
                referrerPolicy="origin"
                // `payment` is required for Razorpay's checkout overlay to
                // initialise (Payment Request API). `clipboard-*` keeps the
                // copy-to-clipboard helpers working.
                allow="payment *; clipboard-read *; clipboard-write *"
                // sandbox flags spelled out so popups + form submission work
                // (Razorpay opens its 3-D Secure flow in a popup, and the
                // checkout form posts back to its own origin).
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
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
        ) : settingsLoading || (walletLoading && !walletData) ? (
          // Right-pane loader during a settings switch and on the first
          // /wallet load. Subsequent /wallet refetches (tab changes inside
          // the wallet pane) intentionally don't tear the whole pane down —
          // see the `loading` prop forwarded to WalletPane instead, which
          // animates a small spinner over just the history list.
          <div className="flex items-center justify-center py-24">
            <div className="loader-spinner" aria-hidden="true" />
          </div>
        ) : selectedKey === 'referandearn' ? (
          // Referandearn renders the /wallet response inline in the right
          // pane. Tab clicks (`onChangeType`) refetch /wallet — `loading`
          // is forwarded so only the history list shows a spinner during
          // the refetch instead of the whole pane disappearing.
          <WalletPane
            data={walletData}
            loading={walletLoading}
            title={selectedItem?.title || 'Wallet'}
            onChangeType={(t) => runWallet({ type: t, page_id: 1 })}
          />
        ) : (
        <>
          {selectedKey === 'myaccount' ? (
          <>
          <section className="flex flex-col md:flex-row md:items-center gap-5 pb-5 border-b border-slate-100 mb-6">
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
            <section className="mb-6">
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
          <section>
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
