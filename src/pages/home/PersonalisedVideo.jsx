import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import {
  getCardViewService,
  shareCardService,
  markAsFavouriteService,
} from '../../services/card.service';
import { notify } from '../../utils/notify';

// Personalised video viewer — minimal player (custom play/pause + thin
// progress bar, no native controls), with a slim floating action stack on
// the right edge of the media. Data comes from location.state.personalised
// (after a Personalise click) OR a fresh /cardview fetch when arriving
// directly from the dashboard carousel.
export default function PersonalisedVideo() {
  const location     = useLocation();
  const { cardkey: rawCardkey } = useParams();
  const [params]     = useSearchParams();
  const cardkey      = decodeURIComponent(rawCardkey || params.get('cardkey') || '');

  const { data: viewData, loading: viewLoading, error: viewError, run: runView } = useApi(getCardViewService);
  useEffect(() => {
    if (location.state?.personalised || !cardkey) return;
    runView({ cardkey, languageid: 0, type: params.get('type') || 'videos' });
  }, [cardkey, location.state, params, runView]);
  useEffect(() => { if (viewError) notify.error(viewError); }, [viewError]);

  const personalised = location.state?.personalised || viewData || {};
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

  const ab           = personalised.action_buttons || {};
  const showShare    = ab.show_share === '1' || ab.show_share === 1;
  const showWhatsapp = ab.share_whatsapp === '1' || ab.share_whatsapp === 1;
  const isShareable  = ab.is_card_shareable === '1' || ab.is_card_shareable === 1;
  const shareErrMsg  = ab.share_error_msg || 'Sharing is unavailable.';
  // Event log type IDs from action_buttons drive /sharecard server-side.
  const shareLogId    = ab.share_event_logtypeid    || '1';
  const whatsappLogId = ab.whatspp_event_logtypeid  || '2';

  const [fav, setFav] = useState(ab.favourite === '1' || ab.favourite === 1);

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

  function onToggleFav() {
    if (!templatekey) return;
    const next = !fav;
    setFav(next);
    markAsFavouriteService({ templatekey, favourite: next ? '1' : '0', type: 'videos' });
  }
  function onShare() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: shareLogId, type: 'videos' });
    if (navigator.share) {
      navigator.share({ title: breadcrumb, url: shareUrl }).catch(() => {});
    }
  }
  function onShareWhatsapp() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: whatsappLogId, type: 'videos' });
    window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
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
      <div className="flex justify-center">
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
              {/* Spinner shown while the .mp4 buffers — sits inside the media
                  container so the surrounding chrome stays put. */}
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
              {/* Rounded progress bar pinned to the bottom — click to seek.
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
            <div className="aspect-video flex items-center justify-center text-white/80 text-sm">
              No personalised video available.
            </div>
          )}

          {/* Floating action stack — compact 36 px buttons in a slim
              translucent capsule pinned to the right edge of the media. */}
          {videoUrl ? (
            <div className="absolute top-1/2 -translate-y-1/2 right-2.5 flex flex-col gap-1.5 bg-black/35 backdrop-blur-md rounded-full px-1.5 py-2 ring-1 ring-white/10">
              <button
                type="button"
                onClick={onToggleFav}
                aria-label={fav ? 'Unfavourite' : 'Favourite'}
                className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center hover:scale-110 transition shadow-soft"
              >
                <svg className="w-4 h-4" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : '#0f172a'} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              {showShare ? (
                <button
                  type="button"
                  onClick={onShare}
                  aria-label="Share"
                  className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-slate-700 hover:scale-110 transition shadow-soft"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
                  </svg>
                </button>
              ) : null}
              {showWhatsapp ? (
                <button
                  type="button"
                  onClick={onShareWhatsapp}
                  aria-label="Send on WhatsApp"
                  className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition shadow-soft"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3.5A11 11 0 0 0 3 17.4L1.6 22l4.7-1.4A11 11 0 1 0 20.5 3.5zm-8.5 17a8.9 8.9 0 0 1-4.6-1.2l-.3-.2-2.8.8.8-2.7-.2-.3a9 9 0 1 1 7.1 3.6zm5-6.6c-.3-.2-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5 0 1.5 1.1 2.9 1.2 3.1.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/></svg>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
