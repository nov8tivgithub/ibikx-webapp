import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

// Renders the details for either a video or a card — same component, gated
// on `type`. Driven entirely by the /cardview response:
//   data.title              → breadcrumb title in the topbar
//   data.type               → "video" | "card"  (image vs <video> preview)
//   data.cardImagepath      → media URL
//   data.cardDetails        → { templatekey, cardImagepath, type }
//   data.languages[]        → language pills ({ languageid, language, is_selected })
//   data.action_buttons     → favourite / share / whatsapp toggles + flags
//   data.show_personilze_btn, data.personilze_btn_text, data.personalize_btn_clickable
//   data.show_purchased_tag, data.purchased_text, data.purchased_icon
//   data.template_name      → small caption beside the media
export default function CardDetails() {
  const navigate                = useNavigate();
  const { cardkey: rawCardkey } = useParams();
  const [params]                = useSearchParams();
  const cardkey                 = decodeURIComponent(rawCardkey || params.get('cardkey') || params.get('templatekey') || '');
  // Type is driven from the URL (?type=videos|cards) but falls back to the
  // path prefix so /video-details/... infers videos automatically.
  const typeFromQuery           = params.get('type');
  const typeFromPath            = window.location.pathname.startsWith('/video-details') ? 'videos' : 'cards';
  const type                    = typeFromQuery || typeFromPath;

  const [languageid, setLanguageid] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, run } = useApi(getCardViewService);
  const personalize                   = useApi(personalizeCardService);

  // Fetch /cardview whenever cardkey / language / type change.
  useEffect(() => {
    if (!cardkey) return;
    run({ cardkey, languageid, type });
  }, [cardkey, languageid, type, run]);

  useEffect(() => { if (error) notify.error(error); }, [error]);

  // When the response lands, sync the selected language to whichever entry
  // the backend flagged as is_selected (if any).
  useEffect(() => {
    const langs = Array.isArray(data?.languages) ? data.languages : [];
    const sel   = langs.find((l) => l.is_selected === '1' || l.is_selected === 1);
    if (sel && sel.languageid !== languageid) setLanguageid(sel.languageid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const detail        = data?.cardDetails || {};
  const mediaUrl      = detail.cardImagepath || data?.cardImagepath || '';
  const templatekey   = detail.templatekey || cardkey;
  const breadcrumb    = data?.title || (type === 'videos' ? 'Video details' : 'Card details');
  const templateName  = data?.template_name || '';
  const languages     = Array.isArray(data?.languages) ? data.languages : [];
  const ab            = data?.action_buttons || {};
  const showFavBtn    = ab.show_favourite === '1' || ab.show_favourite === 1;
  const showShareBtn  = ab.show_share === '1' || ab.show_share === 1;
  const showWhatsapp  = ab.share_whatsapp === '1' || ab.share_whatsapp === 1;
  const isShareable   = ab.is_card_shareable === '1' || ab.is_card_shareable === 1;
  const showPersonalise = data?.show_personilze_btn === '1' || data?.show_personilze_btn === 1;
  const personaliseEnabled = data?.personalize_btn_clickable === '1' || data?.personalize_btn_clickable === 1;
  const personaliseText    = data?.personilze_btn_text || (type === 'videos' ? 'Personalise This Video' : 'Personalise This Card');
  const personaliseWait    = data?.peronalise_content || 'Please wait while we personalise.';
  const showPurchased = data?.show_purchased_tag === '1' || data?.show_purchased_tag === 1;
  const purchasedText = data?.purchased_text || 'Purchased';
  const purchasedIcon = data?.purchased_icon;

  const isVideo = (data?.type || type) === 'video' || (data?.type || type) === 'videos';

  const [fav, setFav] = useState(false);
  useEffect(() => {
    const f = ab.favourite;
    setFav(f === '1' || f === 1);
  }, [ab.favourite]);

  async function onPersonalise() {
    if (!templatekey || !personaliseEnabled) return;
    setSubmitting(true);
    const res = await personalize.run({
      templatekey,
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

  function onShare() {
    if (!isShareable) {
      notify.error(ab.share_error_msg || 'Sharing is unavailable.');
      return;
    }
    if (cardkey) shareCardService({ cardkey, languageid, type });
    if (navigator.share) {
      navigator.share({ title: breadcrumb, url: window.location.href }).catch(() => {});
    }
  }
  function onShareWhatsapp() {
    if (cardkey) shareCardService({ cardkey, languageid, type, channel: 'whatsapp' });
    const url = `https://wa.me/?text=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
        {/* Media preview */}
        <div className="lg:justify-self-end w-full max-w-md">
          <div className="rounded-3xl overflow-hidden bg-slate-900 shadow-soft border border-slate-100 relative">
            <div className="aspect-[3/4] relative bg-slate-100">
              {mediaUrl ? (
                isVideo ? (
                  <video
                    src={mediaUrl}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={breadcrumb}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )
              ) : null}
              {showPurchased ? (
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/95 text-white text-xs font-semibold shadow-soft">
                  {purchasedIcon ? <img src={purchasedIcon} alt="" className="w-4 h-4" /> : null}
                  {purchasedText}
                </span>
              ) : null}
            </div>
          </div>
          {templateName ? (
            <p className="text-center text-xs text-slate-500 mt-2">{templateName}</p>
          ) : null}
        </div>

        {/* Controls */}
        <div className="lg:justify-self-start w-full max-w-md flex flex-col">
          {languages.length ? (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Language</h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((l) => {
                  const active = l.languageid === languageid;
                  return (
                    <button
                      key={l.languageid}
                      type="button"
                      onClick={() => setLanguageid(l.languageid)}
                      className={[
                        'px-4 py-2 rounded-full text-sm font-semibold border transition',
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
            </div>
          ) : null}

          <div className="flex gap-2 mt-6 lg:mt-auto">
            {showFavBtn ? (
              <button
                type="button"
                onClick={onToggleFav}
                aria-label={fav ? 'Unfavourite' : 'Favourite'}
                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            ) : null}
            {showShareBtn ? (
              <button
                type="button"
                onClick={onShare}
                aria-label="Share"
                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
                </svg>
              </button>
            ) : null}
            {showWhatsapp ? (
              <button
                type="button"
                onClick={onShareWhatsapp}
                aria-label="Share on WhatsApp"
                className="w-12 h-12 rounded-xl border border-slate-200 flex items-center justify-center text-emerald-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 3.5A11 11 0 0 0 3 17.4L1.6 22l4.7-1.4A11 11 0 1 0 20.5 3.5zm-8.5 17a8.9 8.9 0 0 1-4.6-1.2l-.3-.2-2.8.8.8-2.7-.2-.3a9 9 0 1 1 7.1 3.6zm5-6.6c-.3-.2-1.6-.8-1.9-.9-.3-.1-.5-.1-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.7l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5 0 1.5 1.1 2.9 1.2 3.1.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/>
                </svg>
              </button>
            ) : null}
            {showPersonalise ? (
              <button
                onClick={onPersonalise}
                disabled={submitting || loading || !personaliseEnabled}
                className="flex-1 bg-brand-gradient-r text-white text-base font-semibold rounded-xl py-3 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Personalising…' : personaliseText}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {submitting && <Loader label={personaliseWait} />}
    </Layout>
  );
}
