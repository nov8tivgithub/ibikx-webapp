import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import {
  getCardViewService,
  personalizeCardService,
  shareCardService,
  markAsFavouriteService,
} from '../../services/card.service';
import { notify } from '../../utils/notify';

// Personalised video viewer — minimal player (custom play/pause + thin
// progress bar, no native controls), with a slim floating action stack on
// the right edge of the media. Data comes from location.state.personalised
// (after a Personalise click) OR a fresh /cardview fetch when arriving
// directly from the dashboard carousel.
//
// Layout mirrors CardDetails: media on the left, controls + info on the
// right (breadcrumb pill, heading, language pills, description, favourite
// + personalise buttons).
export default function PersonalisedVideo() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const { cardkey: rawCardkey } = useParams();
  const [params]     = useSearchParams();
  const cardkey      = decodeURIComponent(rawCardkey || params.get('cardkey') || '');
  const type         = params.get('type') || 'videos';

  const { data: viewData, loading: viewLoading, error: viewError, run: runView } = useApi(getCardViewService);
  const personalize = useApi(personalizeCardService);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.personalised || !cardkey) return;
    runView({ cardkey, languageid: 0, type });
  }, [cardkey, location.state, type, runView]);
  useEffect(() => { if (viewError) notify.error(viewError); }, [viewError]);

  // Prefer the freshest /cardview response once we've fetched at least once
  // (language changes go through runView and need to win over the stale
  // location.state captured when the user first arrived from Personalise).
  const personalised = viewData || location.state?.personalised || {};
  const source       = location.state?.source       || {};

  // /cardview returns the media URL on `cardImagepath` (top-level) as well as
  // mirrored on `cardDetails.cardImagepath`. /personalizecard uses the same
  // shape. Older mocks used `cardimage`/`video_url`/`url` — keep them as
  // fallbacks so location.state-driven flows aren't broken.
  const videoUrl     = personalised.cardImagepath
                       || personalised.cardDetails?.cardImagepath
                       || personalised.cardimage
                       || personalised.video_url
                       || personalised.url;
  const shareUrl     = personalised.shareurl   || videoUrl                || window.location.href;
  const templatekey  = personalised.cardDetails?.templatekey || personalised.templatekey || source.cardDetails?.templatekey;
  // Only show the breadcrumb once the response has actually landed — no
  // generic "Personalised Video" placeholder while loading.
  const breadcrumb   = personalised.title || personalised.categoryname || source.title || '';
  const templateName = personalised.template_name || personalised.cardDetails?.template_name || '';
  const languages    = Array.isArray(personalised.languages) ? personalised.languages : [];
  const description  = personalised.descriptionInfo || {};
  const showDescription = (personalised.action_buttons?.show_description === '1' || personalised.action_buttons?.show_description === 1)
                          && (description.description || description.title);
  const personaliseText = personalised.personilze_btn_text || 'Personalise This Video';
  const personaliseWait = personalised.peronalise_content  || 'Please wait while we personalise.';

  const ab           = personalised.action_buttons || {};
  // Sharing is gated on show_personilze_btn — only available once the card
  // has already been personalised (show_personilze_btn === '0'). While the
  // personalise CTA is visible (value '1'), sharing isn't meaningful yet so
  // the entire action stack stays hidden.
  const canShare     = personalised.show_personilze_btn === '0' || personalised.show_personilze_btn === 0;
  const showShare    = canShare && (ab.show_share === '1' || ab.show_share === 1);
  const showWhatsapp = canShare && (ab.share_whatsapp === '1' || ab.share_whatsapp === 1);
  const isShareable  = ab.is_card_shareable === '1' || ab.is_card_shareable === 1;
  const shareErrMsg  = ab.share_error_msg || 'Sharing is unavailable.';
  // Event log type IDs from action_buttons drive /sharecard server-side.
  const shareLogId    = ab.share_event_logtypeid    || '1';
  const whatsappLogId = ab.whatspp_event_logtypeid  || '2';

  const [fav, setFav]               = useState(false);
  const [languageid, setLanguageid] = useState(0);

  // Sync favourite + selected language whenever the response lands.
  useEffect(() => {
    setFav(ab.favourite === '1' || ab.favourite === 1);
  }, [ab.favourite]);
  useEffect(() => {
    const sel = languages.find((l) =>
      l.is_selected  === '1' || l.is_selected  === 1 ||
      l.ise_selected === '1' || l.ise_selected === 1
    );
    if (sel && sel.languageid !== languageid) setLanguageid(sel.languageid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalised.languages]);

  // Custom player state — same minimal control surface as CardDetails.
  const videoRef             = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100
  // Track whether the <video> file itself has buffered enough to play — keeps
  // the spinner up while the .mp4 streams in, even after the API responded.
  const [videoReady, setVideoReady] = useState(false);
  // Reset readiness whenever the source URL changes (e.g. language switch).
  useEffect(() => { setVideoReady(false); }, [videoUrl]);
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

  // Language pill click — refetch /cardview with the new languageid. Same
  // endpoint, just the languageid parameter changes.
  function onSelectLanguage(id) {
    if (id === languageid) return;
    setLanguageid(id);
    const key = cardkey || templatekey;
    if (key) runView({ cardkey: key, languageid: id, type });
  }

  function onToggleFav() {
    if (!templatekey) return;
    const next = !fav;
    setFav(next);
    markAsFavouriteService({ templatekey, favourite: next ? '1' : '0', type });
  }
  // Share the actual media file (not just a link) via Web Share Level 2.
  // Requires the asset host to allow CORS (the S3 bucket does). Falls back
  // to URL sharing only if the browser doesn't support `files`.
  async function onShare() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: shareLogId, type });
    try {
      const res  = await fetch(videoUrl);
      const blob = await res.blob();
      const ext  = (videoUrl.split('?')[0].split('.').pop() || 'mp4').toLowerCase();
      const mime = blob.type || 'video/mp4';
      const base = (breadcrumb || templateName || 'video').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'video';
      const file = new File([blob], `${base}.${ext}`, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: breadcrumb || templateName, files: [file] });
        return;
      }
    } catch {
      /* fall through to URL share */
    }
    if (navigator.share) {
      navigator.share({ title: breadcrumb, url: shareUrl }).catch(() => {});
    } else {
      notify.error('Sharing is not supported in this browser.');
    }
  }
  // WhatsApp share — wa.me URLs can only carry text, so to attach the
  // actual video we go three layers deep:
  //   1. Try Web Share Level 2 with `files` — best path on mobile + modern
  //      desktop Chromium. The system sheet surfaces WhatsApp directly.
  //   2. If file sharing isn't supported, auto-download the .mp4 and open
  //      WhatsApp Web so the user can drag-attach the file we just saved.
  //   3. Only when the asset can't be fetched at all (CORS / network) do
  //      we fall back to the legacy wa.me text link.
  async function onShareWhatsapp() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: whatsappLogId, type });

    let blob; let filename; let mime;
    try {
      const res = await fetch(videoUrl);
      if (!res.ok) throw new Error('fetch_failed');
      blob = await res.blob();
      const ext  = (videoUrl.split('?')[0].split('.').pop() || 'mp4').toLowerCase();
      mime       = blob.type || 'video/mp4';
      const base = (breadcrumb || templateName || 'video').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'video';
      filename   = `${base}.${ext}`;
    } catch {
      notify.error('Could not load the file (CORS or network). Sharing link instead.');
      window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
      return;
    }

    const file = new File([blob], filename, { type: mime });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: breadcrumb || templateName, files: [file] });
        return;
      } catch {
        /* user cancelled or share failed — fall through to download */
      }
    }

    // Auto-download the file and open WhatsApp Web so the user can drag it in.
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objUrl), 5000);
    notify.success('File downloaded. Attach it in WhatsApp.');
    window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer');
  }

  // Re-personalise with the selected language. Same payload as CardDetails.
  async function onPersonalise() {
    if (!templatekey) return;
    setSubmitting(true);
    const res = await personalize.run({
      templatekey,
      languageid,
      favourite: fav ? '1' : '0',
      type,
    });
    setSubmitting(false);
    if (res?.status === 1 || res?.status === '1') {
      // Replace the current route with the freshly personalised payload so
      // the back button still returns to the previous page (not the stale
      // personalised view).
      navigate(type === 'videos' ? '/personalised-video' : '/personalised-card', {
        state: { personalised: res.data, source: personalised },
        replace: true,
      });
    } else {
      notify.error(res?.message || 'Could not personalise.');
    }
  }

  return (
    <Layout
      active="home"
      title={breadcrumb}
      back
      // Show the full-page loader as soon as we mount without pre-fetched
      // state — covers the gap between mount and the first response. Stays
      // up until either /cardview responds with data or surfaces an error.
      loading={!location.state?.personalised && !viewData && !viewError}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
        {/* Media preview — same height envelope as CardDetails. */}
        <div className="lg:justify-self-end w-full flex justify-center">
          <div
            className="rounded-3xl overflow-hidden bg-black shadow-2xl relative flex items-center justify-center"
            style={{ height: 'min(calc(100vh - 9rem), 760px)', minHeight: '24rem' }}
          >
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
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
                {/* Spinner shown while the .mp4 buffers. */}
                {!videoReady ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
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
                {/* Rounded progress bar pinned to the bottom — click to seek. */}
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
              <div className="aspect-video flex items-center justify-center text-white/80 text-sm">
                No personalised video available.
              </div>
            )}

          </div>
        </div>

        {/* Controls + info column — mirrors CardDetails. */}
        <div className="lg:justify-self-start w-full max-w-lg flex flex-col self-center">
          {breadcrumb ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
              {breadcrumb}
            </span>
          ) : null}

          {templateName || breadcrumb ? (
            <h1 className="mt-4 text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
              {templateName || breadcrumb}
            </h1>
          ) : null}

          {/* Description block — driven by action_buttons.show_description. */}
          {showDescription ? (
            <div className="mt-6">
              {description.title ? (
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  {description.title}
                </h3>
              ) : null}
              {description.description ? (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {description.description}
                </p>
              ) : null}
            </div>
          ) : null}

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
                      onClick={() => onSelectLanguage(l.languageid)}
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

          {/* Action row — when the card is still un-personalised
              (show_personilze_btn === '1') it pairs Favourite + Personalise.
              Once personalised (show_personilze_btn === '0' ⇒ canShare),
              the Personalise CTA is replaced by the Share + WhatsApp
              buttons inline so the same slot drives the next action. */}
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
            {!canShare ? (
              <button
                onClick={onPersonalise}
                disabled={submitting || viewLoading || !templatekey}
                className="flex-1 bg-brand-blue text-white text-base font-bold rounded-2xl py-4 px-6 shadow-soft hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? 'Personalising…' : personaliseText}
              </button>
            ) : (
              <>
                {showShare ? (
                  <button
                    type="button"
                    onClick={onShare}
                    aria-label="Share"
                    className="w-14 h-14 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:border-brand-blue/40 transition shrink-0"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
                    </svg>
                  </button>
                ) : null}
                {showWhatsapp ? (
                  <button
                    type="button"
                    onClick={onShareWhatsapp}
                    aria-label="Send on WhatsApp"
                    className="flex-1 bg-emerald-500 text-white text-base font-bold rounded-2xl py-4 px-6 shadow-soft hover:opacity-95 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3.5A11 11 0 0 0 3 17.4L1.6 22l4.7-1.4A11 11 0 1 0 20.5 3.5zm-8.5 17a8.9 8.9 0 0 1-4.6-1.2l-.3-.2-2.8.8.8-2.7-.2-.3a9 9 0 1 1 7.1 3.6zm5-6.6c-.3-.2-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5 0 1.5 1.1 2.9 1.2 3.1.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/></svg>
                    Share on WhatsApp
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      {submitting && <Loader label={personaliseWait} />}
    </Layout>
  );
}
