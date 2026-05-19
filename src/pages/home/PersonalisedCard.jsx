import { useEffect, useState } from 'react';
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

// Renders the personalised card returned by /personalizecard (or fetched
// via /cardview when arriving from the dashboard carousel). Layout mirrors
// PersonalisedVideo / CardDetails: media on the left, controls + info on
// the right (breadcrumb, heading, description, language pills, favourite +
// personalise buttons).
export default function PersonalisedCard() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const { cardkey: rawCardkey } = useParams();
  const [params]     = useSearchParams();
  const cardkey      = decodeURIComponent(rawCardkey || params.get('cardkey') || '');
  const type         = params.get('type') || 'cards';

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

  const previewUrl   = personalised.cardImagepath
                       || personalised.cardDetails?.cardImagepath
                       || personalised.cardimage
                       || personalised.preview_url
                       || personalised.image
                       || personalised.url;
  const shareUrl     = personalised.shareurl  || previewUrl                || window.location.href;
  const templatekey  = personalised.cardDetails?.templatekey || personalised.templatekey || source.cardDetails?.templatekey;
  const breadcrumb   = personalised.title || personalised.categoryname || source.title || '';
  const templateName = personalised.template_name || personalised.cardDetails?.template_name || '';
  const languages    = Array.isArray(personalised.languages) ? personalised.languages : [];
  const description  = personalised.descriptionInfo || {};
  const showDescription = (personalised.action_buttons?.show_description === '1' || personalised.action_buttons?.show_description === 1)
                          && (description.description || description.title);
  const personaliseText = personalised.personilze_btn_text || 'Personalise This Card';
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
  const shareLogId    = ab.share_event_logtypeid    || '1';
  const whatsappLogId = ab.whatspp_event_logtypeid  || '2';

  const [fav, setFav]               = useState(false);
  const [languageid, setLanguageid] = useState(0);

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

  // Language pill click — refetch /cardview with the new languageid.
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
  // Share the actual card image (not just a link) via Web Share Level 2.
  // Requires the asset host to allow CORS (the S3 bucket does). Falls back
  // to URL sharing only if the browser doesn't support `files`.
  async function onShare() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: shareLogId, type });
    try {
      const res  = await fetch(previewUrl);
      const blob = await res.blob();
      const ext  = (previewUrl.split('?')[0].split('.').pop() || 'png').toLowerCase();
      const mime = blob.type || 'image/png';
      const base = (breadcrumb || templateName || 'card').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'card';
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
  // WhatsApp share — wa.me URLs can only carry text, so to actually attach
  // the card image we route through the native share sheet (Web Share L2).
  // On mobile this surfaces WhatsApp prominently so the user lands in WA
  // with the file pre-attached. On browsers without file sharing support
  // (desktop Chromium) we fall back to the wa.me text link.
  async function onShareWhatsapp() {
    if (!isShareable) { notify.error(shareErrMsg); return; }
    if (templatekey) shareCardService({ templatekey, eventlogtypeid: whatsappLogId, type });
    try {
      const res  = await fetch(previewUrl);
      const blob = await res.blob();
      const ext  = (previewUrl.split('?')[0].split('.').pop() || 'png').toLowerCase();
      const mime = blob.type || 'image/png';
      const base = (breadcrumb || templateName || 'card').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'card';
      const file = new File([blob], `${base}.${ext}`, { type: mime });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: breadcrumb || templateName, files: [file] });
        return;
      }
    } catch {
      /* fall through to wa.me text link */
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
  }

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
      loading={!location.state?.personalised && !viewData && !viewError}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto">
        <div className="lg:justify-self-end w-full flex justify-center">
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

          </div>
        </div>

        {/* Controls + info column. */}
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
