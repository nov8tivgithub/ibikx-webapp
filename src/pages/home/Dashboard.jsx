import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CoverCarousel from '../../components/common/CoverCarousel';
import NoRecords from '../../components/common/NoRecords';
import ScrollRow from '../../components/common/ScrollRow';
import CategoryTile from '../../components/catalog/CategoryTile';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { usePreScreen } from '../../context/PreScreenContext';
import { getDashboardService } from '../../services/catalog.service';
import { getCardViewService } from '../../services/card.service';
import { subLink } from '../../data/categories';
import { notify } from '../../utils/notify';
import { SLIDEVIDEO_PAUSE_ENABLED } from '../../config/constants';

// Returns true when the page is visible (tab active + window not minimised).
// Subscribes to the Page Visibility API + window focus/blur and re-renders.
function usePageVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden
  );
  useEffect(() => {
    function onVis() { setVisible(!document.hidden); }
    function onFocus() { setVisible(!document.hidden); }
    function onBlur() {
      // A blurred window is effectively not being viewed — pause autoplaying
      // media even if the tab itself is still technically "visible".
      setVisible(false);
    }
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, []);
  return visible;
}

// Fallback tabs used until the API responds (or if the field is missing).
const FALLBACK_TABS = [
  { title: 'Videos', type: 'videos' },
  { title: 'Cards',  type: 'cards' },
];

// One slide rendered inside the cover carousel — driven by an API card object.
// `isActive` is injected by CoverCarousel via cloneElement. Only the active
// video card mounts a <video> element + plays; other video slides show their
// poster image so we don't decode/stream a dozen videos at once.
//
// Playback is gated on (in addition to isActive): the slide being scrolled
// into view, the browser tab being visible, AND no pre-screen overlay open.
// All three conditions are forwarded by Dashboard via `playableContext`.
function FeaturedSlide({ card, type, isActive, playableContext }) {
  const image       = card.card_path || card.imageLink || card.image_path || card.image || card.preview_image || card.thumbnail;
  const video       = card.video_path || card.video || card.videoLink;
  const isVideo     = !!video && (type === 'videos' || card.is_video === '1' || card.is_video === 1 || card.type === 'video');
  const cardkey     = card.templatekey || card.cardkey || card.key || card.videokey || card.id;
  const categorykey = card.categorykey || '';
  // Carousel cards always open the personalised preview — they're the cards
  // the user has already personalised once.
  const path        = type === 'videos' ? '/personalised-video' : '/personalised-card';
  const to          = `${path}/${encodeURIComponent(cardkey || '')}?type=${encodeURIComponent(type)}${categorykey ? `&categorykey=${encodeURIComponent(categorykey)}` : ''}`;
  // Fire /cardview tracker on click — fire-and-forget, the navigation
  // happens regardless.
  function onCardClick() {
    getCardViewService({ cardkey: card.cardkey || cardkey, languageid: 0, type });
  }

  const videoRef = useRef(null);
  // Start unmuted (user just logged in, so the most recent gesture grants
  // autoplay-with-sound permission in most browsers). The useEffect below
  // falls back to muted if play() rejects due to autoplay policy.
  const [muted, setMuted]   = useState(false);
  const [paused, setPaused] = useState(false);

  // Only the active video card actually mounts a <video> element.
  const showVideo = isActive && isVideo;

  // External pause signals from Dashboard: pageVisible (tab/window in view),
  // carouselInView (IntersectionObserver on the carousel root), and
  // preScreenOpen (announcement overlay). Any of these going false halts
  // playback even if the user hasn't manually paused.
  const { pageVisible, carouselInView, preScreenOpen } = playableContext || {
    pageVisible: true, carouselInView: true, preScreenOpen: false,
  };
  const shouldPlay = showVideo && !paused && pageVisible && carouselInView && !preScreenOpen;

  // Drive playback from React state. If play() rejects (e.g. unmuted autoplay
  // blocked on a cold refresh), force muted=true and the next effect tick
  // replays muted so the carousel still animates on first load.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !showVideo) return;
    if (!shouldPlay) { el.pause(); return; }
    el.play().catch(() => { if (!muted) setMuted(true); });
  }, [showVideo, shouldPlay, muted]);

  function stop(e) { e.preventDefault(); e.stopPropagation(); }
  function togglePause(e) { stop(e); setPaused((p) => !p); }
  function toggleMute(e) {
    stop(e);
    setMuted((m) => {
      const next = !m;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  }

  return (
    <Link to={to} onClick={onCardClick} className="block w-full h-full">
      <div className="cover-slide-inner">
        {showVideo ? (
          <video
            ref={videoRef}
            src={video}
            poster={image || undefined}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted={muted}
            playsInline
            preload="metadata"
          />
        ) : image ? (
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : null}

        {/* Pause / mute pills — only on the active video card, bottom-right.
            The play/pause toggle is gated on SLIDEVIDEO_PAUSE_ENABLED so
            deployments can hide it entirely; the mute toggle stays. */}
        {showVideo ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            {SLIDEVIDEO_PAUSE_ENABLED ? (
              <button
                type="button"
                onClick={togglePause}
                aria-label={paused ? 'Play' : 'Pause'}
                className="w-6 h-6 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur flex items-center justify-center text-white"
              >
                {paused ? (
                  <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
                ) : (
                  <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="w-6 h-6 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur flex items-center justify-center text-white"
            >
              {muted ? (
                <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4 9.91 6.09 12 8.18V4z" /></svg>
              ) : (
                <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

// Inline spinner used while a tab switch is re-fetching — keeps the page
// shell + greeting + menu list visible and only loaders the parts of the
// page that actually change (carousel + category rows).
function SectionSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="loader-spinner" aria-hidden="true" />
    </div>
  );
}

// Action cards from data.menuList. menuColor is the row background; key is the
// Renders one category row from the /dashboardnew response.
function ApiCategorySection({ category }) {
  const subs = Array.isArray(category?.sub_categories) ? category.sub_categories : [];
  if (!subs.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h2 className="text-lg lg:text-xl font-bold text-slate-900">{category.categoryname}</h2>
        {category.show_viewmore ? (
          <Link
            to={`/category/${encodeURIComponent(category.categorykey)}`}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 px-2.5 py-1 rounded-full transition"
          >
            View all
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ) : null}
      </div>
      <ScrollRow>
        {subs.map((sub) => (
          <CategoryTile
            key={sub.categoryid}
            title={sub.categoryname}
            image={sub.imageLink}
            to={subLink(category.categorykey, sub.categorykey)}
          />
        ))}
      </ScrollRow>
    </div>
  );
}


export default function Dashboard() {
  // Default tab is "videos". Each switch refetches with the new `type`.
  const [type, setType]                  = useState('videos');
  const { data, loading, error, run }    = useApi(getDashboardService);
  const { user, refreshUser }            = useAuth();
  const preScreen                        = usePreScreen();
  const preScreenOpen                    = !!preScreen?.data;
  const pageVisible                      = usePageVisible();

  // IntersectionObserver on the carousel container — once the user scrolls
  // past the carousel (so it's not in view), inView flips false and the
  // active video stops auto-playing. Threshold of 0.25 keeps playback going
  // while at least a quarter of the carousel is on screen.
  const carouselRef                      = useRef(null);
  const [carouselInView, setCarouselInView] = useState(true);
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCarouselInView(entry.isIntersecting),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [data]); // re-observe after the carousel mounts post-load

  useEffect(() => { run(type); }, [type, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  // Merge userinfo (imagelink, title, description) into the stored user, and
  // store the dashboard's menu items under the dedicated `headerMenuList`
  // key so the Topbar reads it without colliding with /myaccount.menuList
  // (which lives only on the profile page).
  useEffect(() => {
    const ui   = data?.userinfo;
    const list = Array.isArray(data?.menuList) ? data.menuList : null;
    if (!ui && !list) return;
    const sameUi = !ui
      || ((ui.imagelink   ?? null) === (user?.imagelink   ?? null)
       && (ui.title       ?? null) === (user?.title       ?? null)
       && (ui.description ?? null) === (user?.description ?? null));
    const sameMenu = !list
      || JSON.stringify(list) === JSON.stringify(user?.headerMenuList || null);
    if (sameUi && sameMenu) return;
    refreshUser({
      ...(user || {}),
      ...(ui || {}),
      ...(list ? { headerMenuList: list } : {}),
      // Drop any legacy `menuList` key that older versions may have written.
      menuList: undefined,
    });
  }, [data, user, refreshUser]);

  // Tabs in the order the API returns them.
  const tabs = Array.isArray(data?.dashboard_tabs) && data.dashboard_tabs.length
    ? data.dashboard_tabs
    : FALLBACK_TABS;

  const userinfo   = data?.userinfo;
  const cards      = Array.isArray(data?.cards) ? data.cards : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];

  return (
    <Layout active="home" loading={!data && !error}>
      <section className="mb-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight truncate">
            {userinfo?.title || (loading ? 'Loading…' : 'Hi 👋')}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            {userinfo?.description || 'Explore our templates'}
          </p>
        </div>
        <div className="segmented inline-flex bg-slate-100 rounded-full p-1 shadow-soft shrink-0 self-center">
          {tabs.map((t) => (
            <button
              key={t.type}
              type="button"
              className={`py-2 px-6 rounded-full text-sm font-semibold text-slate-600${type === t.type ? ' is-active' : ''}`}
              data-tab={t.type}
              disabled={loading && type !== t.type}
              onClick={() => { if (type !== t.type) setType(t.type); }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </section>

      {/* Everything below the greeting + tabs is tab-specific. A single
          SectionSpinner replaces the entire block while a tab switch
          re-fetches /dashboardnew. */}
      {loading ? (
        <SectionSpinner />
      ) : (
        <div>
          {/* Featured carousel or empty state. */}
          {cards.length === 0 ? (
            <NoRecords />
          ) : (
            <div ref={carouselRef}>
              <CoverCarousel
                ariaLabel={type === 'videos' ? 'Featured videos' : 'Featured cards'}
                slides={cards.map((c) => (
                  <FeaturedSlide
                    key={c.key || c.cardkey || c.videokey || c.id}
                    card={c}
                    type={type}
                    playableContext={{ pageVisible, carouselInView, preScreenOpen }}
                  />
                ))}
              />
            </div>
          )}

          {/* (MenuList moved into the Topbar via user.menuList.) */}

          {/* Category rows. */}
          <div className="space-y-6">
            {categories.map((c) => (
              <ApiCategorySection key={c.categoryid} category={c} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
