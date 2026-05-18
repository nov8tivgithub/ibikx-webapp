import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import {
  getCardDetailsService,
  personalizeCardService,
  markAsFavouriteService,
} from '../../services/card.service';
import { notify } from '../../utils/notify';

// Renders the details for either a video or a card — same component, gated
// on `type`. Driven by /carddetails (parameters: templatekey, categorykey,
// favourite, languageid, type). The path param `:cardkey` carries what the
// backend calls templatekey. `categorykey` is supplied via ?categorykey=...
// on the URL (linker pages — Dashboard, Subcategory, etc. — set it).
//
// Notable response fields the JSX renders:
//   data.title              → breadcrumb title in the topbar
//   data.type               → "video" | "card"
//   data.cardImagepath      → media URL
//   data.cardDetails        → { templatekey, cardImagepath, type }
//   data.languages[]        → language pills
//   data.action_buttons     → favourite / share / whatsapp toggles + flags
//   data.is_free            → drives FREE pill vs CROWN badge
//   data.template_name      → headline / accent word
//   data.personalize_btn_clickable, data.personilze_btn_text
export default function CardDetails() {
  const navigate                = useNavigate();
  const { cardkey: rawCardkey } = useParams();
  const [params]                = useSearchParams();
  // The path param is `cardkey`, but it carries the value the backend calls
  // `templatekey` — they're the same string in this app.
  const templatekey             = decodeURIComponent(rawCardkey || params.get('cardkey') || params.get('templatekey') || '');
  const categorykey             = params.get('categorykey') || '';
  // Type is driven from the URL (?type=videos|cards) but falls back to the
  // path prefix so /video-details/... infers videos automatically.
  const typeFromQuery           = params.get('type');
  const typeFromPath            = window.location.pathname.startsWith('/video-details') ? 'videos' : 'cards';
  const type                    = typeFromQuery || typeFromPath;

  const [languageid, setLanguageid] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, run } = useApi(getCardDetailsService);
  const personalize                   = useApi(personalizeCardService);

  // Fetch /carddetails whenever templatekey / language / type change.
  useEffect(() => {
    if (!templatekey) return;
    run({ templatekey, categorykey, favourite: '0', languageid, type });
  }, [templatekey, categorykey, languageid, type, run]);

  useEffect(() => { if (error) notify.error(error); }, [error]);

  // When the response lands, sync the selected language. The API spells the
  // flag "ise_selected" (sic — keeping the typo plus the older "is_selected"
  // as a fallback in case the backend fixes it).
  useEffect(() => {
    const langs = Array.isArray(data?.languages) ? data.languages : [];
    const sel   = langs.find((l) =>
      l.ise_selected === '1' || l.ise_selected === 1 ||
      l.is_selected  === '1' || l.is_selected  === 1
    );
    if (sel && sel.languageid !== languageid) setLanguageid(sel.languageid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // /carddetails response shape:
  //   data.template            → { templatekey, video_path, imageLink, title, ... }
  //   data.categoryname        → breadcrumb (e.g. "Plan based > Child Education")
  //   data.template_name       → headline name (e.g. "test")
  //   data.languages[]         → language pills (ise_selected on the chosen one)
  //   data.action_buttons      → favourite / share / whatsapp toggles
  //   data.is_free             → drives FREE pill vs CROWN badge
  //   data.daily_limit_reached → "1" disables Personalise; daily_limit_message shown above
  const template      = data?.template     || {};
  const mediaUrl      = type === 'videos'
                          ? (template.video_path || template.videoLink || data?.cardImagepath || '')
                          : (template.imageLink  || template.image      || data?.cardImagepath || '');
  const breadcrumb    = data?.categoryname || data?.title || (type === 'videos' ? 'Video details' : 'Card details');
  const templateName  = data?.template_name || template.title || '';
  const languages     = Array.isArray(data?.languages) ? data.languages : [];
  const ab            = data?.action_buttons || {};
  const personaliseEnabled = data?.personalize_btn_clickable === '1' || data?.personalize_btn_clickable === 1;
  const personaliseText    = data?.personilze_btn_text || (type === 'videos' ? 'Personalise This Video' : 'Personalise This Card');
  const personaliseWait    = data?.peronalise_content || 'Please wait while we personalise.';

  // FREE/CROWN badge — videos only (driven by the URL type).
  const isVideo    = type === 'videos' || type === 'video';
  const isFree     = data?.is_free === 1 || data?.is_free === '1';
  const showBadge  = isVideo;

  const [fav, setFav] = useState(false);
  useEffect(() => {
    const f = ab.favourite;
    setFav(f === '1' || f === 1);
  }, [ab.favourite]);

  async function onPersonalise() {
    const key = template.templatekey || templatekey;
    if (!key || !personaliseEnabled) return;
    setSubmitting(true);
    const res = await personalize.run({
      templatekey: key,
      languageid,
      favourite: fav ? '1' : '0',
      type,
    });
    setSubmitting(false);
    if (res?.status === 1 || res?.status === '1') {
      navigate(isVideo ? '/personalised-video' : '/personalised-card', {
        state: { personalised: res.data, source: data },
      });
    } else {
      notify.error(res?.message || 'Could not personalise.');
    }
  }

  // Custom video play/pause + progress bar — the native controls are
  // suppressed so the page only exposes the play button (when paused) and a
  // slim progress strip at the bottom that doubles as a click-to-seek bar.
  const videoRef              = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  // Track whether the <video> file itself has buffered — keeps the spinner
  // up while the .mp4 streams in (in addition to the API refetch overlay).
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => { setVideoReady(false); }, [mediaUrl]);
  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else           el.pause();
  }
  function onTimeUpdate(e) {
    const el = e.currentTarget;
    if (el.duration > 0) setProgress((el.currentTime / el.duration) * 100);
  }
  function onSeek(e) {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * el.duration;
    setProgress(pct * 100);
  }
  function onToggleFav() {
    if (!templatekey) return;
    const next = !fav;
    setFav(next);
    markAsFavouriteService({ templatekey, favourite: next ? '1' : '0', type });
  }

  return (
    <Layout active="home" title={breadcrumb} back loading={!data && !error}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
        {/* Media preview — height tracks the viewport so portrait video/card
            fits the screen; width is automatic to preserve natural aspect. */}
        <div className="lg:justify-self-end w-full flex justify-center">
          <div
            className="rounded-3xl overflow-hidden bg-slate-900 shadow-soft border border-slate-100 relative flex items-center justify-center"
            style={{ height: 'min(calc(100vh - 9rem), 760px)', minHeight: '24rem' }}
          >
            <div className="relative bg-slate-100 h-full">
              {mediaUrl ? (
                isVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={mediaUrl}
                      playsInline
                      preload="auto"
                      className={`block h-full w-auto ${videoReady ? '' : 'invisible'}`}
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => setPlaying(false)}
                      onTimeUpdate={onTimeUpdate}
                      onLoadedData={() => setVideoReady(true)}
                      onCanPlay={() => setVideoReady(true)}
                      onClick={togglePlay}
                    />
                    {/* Spinner shown while the .mp4 buffers — inside the
                        media container so surrounding chrome stays put. */}
                    {!videoReady ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        <div className="loader-spinner" aria-hidden="true" />
                      </div>
                    ) : null}
                    {/* Centred play overlay — only visible while paused. */}
                    {videoReady && !playing ? (
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label="Play"
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition"
                      >
                        <span className="w-16 h-16 rounded-full bg-white/85 flex items-center justify-center text-slate-900 shadow-soft">
                          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
                        </span>
                      </button>
                    ) : null}
                    {/* Thicker rounded progress bar pinned to the bottom of
                        the video — matches the player chrome in the mockup.
                        A small playhead dot sits at the leading edge of the
                        filled portion. Click anywhere on the track to seek.
                        Hidden until the video has actually buffered. */}
                    {videoReady ? (
                    <div
                      onClick={onSeek}
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                      className="absolute left-4 right-4 bottom-4 h-4 cursor-pointer flex items-center"
                    >
                      <div className="relative h-1.5 w-full bg-white/30 rounded-full">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                        <span
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-soft"
                          style={{ left: `calc(${progress}% - 6px)` }}
                        />
                      </div>
                    </div>
                    ) : null}
                  </>
                ) : (
                  <img
                    src={mediaUrl}
                    alt={breadcrumb}
                    className="block h-full w-auto"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )
              ) : null}
              {/* FREE / CROWN badge — videos only, driven by is_free. The
                  details-page version is a solid brand-blue pill (matches
                  the mockup) instead of the lighter listing variant. */}
              {showBadge ? (
                isFree ? (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-blue text-white text-xs font-bold uppercase tracking-wider shadow-soft">
                    FREE
                  </span>
                ) : (
                  <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center text-brand-gold" aria-label="Premium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 16 2 7l5.5 4L12 4l4.5 7L22 7l-3 9H5zm-1 4h16v-2H4v2z" />
                    </svg>
                  </span>
                )
              ) : null}
            </div>
            {/* Refetch overlay — covers the media (not the whole page) while
                a language change is loading the new media. First-load is
                still handled by Layout's PageSpinner via `loading={!data}`. */}
            {loading && data ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 backdrop-blur-sm">
                <div className="loader-spinner" aria-hidden="true" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Controls */}
        <div className="lg:justify-self-start w-full max-w-lg flex flex-col self-center">
          {/* Breadcrumb pill — light slate chip with a brand-blue dot. */}
          {breadcrumb ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              {breadcrumb}
            </span>
          ) : null}

          {/* Heading — uses template_name if present, otherwise falls back
              to the breadcrumb. The last word picks up a purple/pink
              gradient accent like the mockup. */}
          <h1 className="mt-4 text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            {(() => {
              const text = templateName || breadcrumb || '';
              const parts = text.trim().split(/\s+/);
              if (parts.length <= 1) return text;
              const last = parts.pop();
              return (
                <>
                  {parts.join(' ')}{' '}
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}>
                    {last}
                  </span>
                </>
              );
            })()}
          </h1>

          {languages.length ? (
            <>
              <div className="mt-8 flex items-center gap-2 text-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Choose Language</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {languages.map((l) => {
                  const active = l.languageid === languageid;
                  return (
                    <button
                      key={l.languageid}
                      type="button"
                      onClick={() => setLanguageid(l.languageid)}
                      className={[
                        'px-5 py-2 rounded-full text-sm font-semibold border transition',
                        active
                          ? 'bg-brand-blue text-white border-brand-blue shadow-soft'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-blue/40',
                      ].join(' ')}
                    >
                      {l.language}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onToggleFav}
              aria-label={fav ? 'Unfavourite' : 'Favourite'}
              className="w-14 h-14 rounded-2xl border border-slate-200 bg-white flex items-center justify-center hover:border-brand-blue/40 transition shrink-0"
            >
              <svg className="w-6 h-6" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : 'currentColor'} strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              onClick={onPersonalise}
              disabled={submitting || loading || !personaliseEnabled}
              className="flex-1 bg-brand-blue text-white text-base font-bold rounded-2xl py-4 px-6 shadow-soft hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? 'Personalising…' : personaliseText}
            </button>
          </div>
        </div>
      </div>
      {submitting && <Loader label={personaliseWait} />}
    </Layout>
  );
}
