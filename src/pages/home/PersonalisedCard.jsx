import { useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import {
  getCardViewService,
  shareCardService,
  markAsFavouriteService,
} from '../../services/card.service';
import { notify } from '../../utils/notify';

// Renders the personalised card returned by /personalizecard. CardDetails
// navigates here with the response in location.state.personalised. Same
// field surface as PersonalisedVideo, but the media is an image.
export default function PersonalisedCard() {
  const location     = useLocation();
  const { cardkey: rawCardkey } = useParams();
  const [params]     = useSearchParams();
  const cardkey      = decodeURIComponent(rawCardkey || params.get('cardkey') || '');

  const { data: viewData, loading: viewLoading, error: viewError, run: runView } = useApi(getCardViewService);
  useEffect(() => {
    if (location.state?.personalised || !cardkey) return;
    runView({ cardkey, languageid: 0, type: params.get('type') || 'cards' });
  }, [cardkey, location.state, params, runView]);
  useEffect(() => { if (viewError) notify.error(viewError); }, [viewError]);

  const personalised = location.state?.personalised || viewData || {};
  const source       = location.state?.source       || {};

  // /cardview returns the media URL on `cardImagepath` (top-level) and
  // mirrors it on `cardDetails.cardImagepath`. /personalizecard uses the
  // same shape. Older mocks used `cardimage`/`preview_url`/`image`/`url` —
  // keep those as fallbacks.
  const previewUrl   = personalised.cardImagepath
                       || personalised.cardDetails?.cardImagepath
                       || personalised.cardimage
                       || personalised.preview_url
                       || personalised.image
                       || personalised.url;
  const shareUrl     = personalised.shareurl  || previewUrl                || window.location.href;
  const templatekey  = personalised.cardDetails?.templatekey || personalised.templatekey || source.cardDetails?.templatekey;
  // Only show the breadcrumb once the response has landed.
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

  function onToggleFav() {
    if (!templatekey) return;
    const next = !fav;
    setFav(next);
    markAsFavouriteService({ templatekey, favourite: next ? '1' : '0', type: 'cards' });
  }
  function onShare() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: shareLogId, type: 'cards' });
    if (navigator.share) {
      navigator.share({ title: breadcrumb, url: shareUrl }).catch(() => {});
    }
  }
  function onShareWhatsapp() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: whatsappLogId, type: 'cards' });
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
          className="rounded-3xl overflow-hidden shadow-2xl bg-white relative flex items-center justify-center"
          style={{ height: 'min(calc(100vh - 9rem), 760px)', minHeight: '24rem' }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={breadcrumb}
              className="block h-full w-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="aspect-[3/4] flex items-center justify-center bg-slate-100 text-slate-500 text-sm">
              No personalised card available.
            </div>
          )}

          {/* Compact floating action stack inside the media. */}
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
        </div>
      </div>
    </Layout>
  );
}
