import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LanguagePills from '../../components/common/LanguagePills';
import Loader from '../../components/common/Loader';
import { useApi } from '../../hooks/useApi';
import {
  getCardDetailsService,
  personalizeCardService,
  recordCardViewService,
  shareCardService,
  markAsFavouriteService,
} from '../../services/card.service';
import { notify } from '../../utils/notify';

const LANG_TO_ID = { en: 0, hi: 1, ml: 2, ta: 3, gu: 4 };

export default function CardDetails() {
  const navigate                          = useNavigate();
  const [params]                          = useSearchParams();
  // URL contract: ?templatekey=<...>&categorykey=<...>&type=<videos|cards>
  // (legacy `?key=` is treated as templatekey for back-compat)
  const templatekey                       = params.get('templatekey') || params.get('key') || '';
  const categorykey                       = params.get('categorykey') || '';
  const type                              = params.get('type') || 'cards';
  const [language, setLanguage]           = useState('en');
  const [submitting, setSubmitting]       = useState(false);
  const [fav, setFav]                     = useState(false);

  const { data, loading, error, run }     = useApi(getCardDetailsService);
  const personalize                       = useApi(personalizeCardService);

  // Fetch on mount. Record view fires only after we've received the cardkey
  // from the response (the cardkey != templatekey per the live payloads).
  useEffect(() => {
    if (!templatekey) return;
    run({ templatekey, categorykey, favourite: '0', languageid: LANG_TO_ID[language] ?? 0, type });
  }, [templatekey, categorykey, type, language, run]);

  const viewedRef = useRef(false);
  useEffect(() => {
    const cardkey = data?.cardkey;
    if (!cardkey || viewedRef.current) return;
    viewedRef.current = true;
    recordCardViewService({ cardkey, languageid: LANG_TO_ID[language] ?? 0, type }); // fire-and-forget
  }, [data?.cardkey, language, type]);

  useEffect(() => { if (error) notify.error(error); }, [error]);
  useEffect(() => { if (data?.is_favourite) setFav(true); }, [data?.is_favourite]);

  async function onPersonalise() {
    if (!templatekey) return;
    setSubmitting(true);
    const res = await personalize.run({
      templatekey,
      categorykey,
      languageid: LANG_TO_ID[language] ?? 0,
      type,
    });
    setSubmitting(false);
    if (res?.status === 1 || res?.status === '1') {
      navigate('/personalised-card', { state: { personalised: res.data, source: data } });
    } else {
      notify.error(res?.message || 'Could not personalise this card.');
    }
  }

  function onShare() {
    const cardkey = data?.cardkey;
    if (cardkey) shareCardService({ cardkey, languageid: LANG_TO_ID[language] ?? 0, type });
    if (navigator.share) {
      navigator.share({ title: data?.title || 'Share', url: window.location.href }).catch(() => {});
    }
  }

  function onToggleFav() {
    if (!templatekey) return;
    const next = !fav;
    setFav(next);
    markAsFavouriteService({ templatekey, cardkey: data?.cardkey, value: next ? '1' : '0', type });
  }

  const title       = data?.title       || 'Card details';
  const subtitle    = data?.subtitle    || 'Life Insurance';
  const heading     = data?.heading     || data?.headline || 'Take the responsibility + protect your family';
  const offer       = data?.offer_text  || 'Save ₹87/day, get';
  const amount      = data?.amount_text || 'RS. 44,19,000';
  const tail        = data?.tail_text   || 'at maturity';
  const previewImg  = data?.preview_image || data?.image || data?.image_path || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800';
  const breadcrumb  = data?.breadcrumb  || data?.title || 'Plan Based > Retirement';

  return (
    <Layout active="home" title={breadcrumb} back loading={!data && !error}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div className="lg:justify-self-end w-full max-w-md">
          <div className="rounded-3xl overflow-hidden bg-white shadow-soft border border-slate-100">
            <div className="aspect-[3/4] bg-gradient-to-br from-amber-50 to-amber-100 relative">
              <div className="absolute top-6 left-6 right-6">
                <p className="text-slate-700 text-sm">{subtitle}</p>
                <p className="text-slate-900 font-bold text-2xl mt-1 leading-tight">{heading}</p>
                <p className="text-amber-700 font-bold text-lg mt-3">{offer}</p>
                <p className="text-amber-600 font-bold text-3xl">{amount}</p>
                <p className="text-slate-700 font-semibold mt-1">{tail}</p>
              </div>
              <img
                src={previewImg}
                alt={title}
                className="absolute bottom-0 left-0 right-0 h-1/2 w-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>

        <div className="lg:justify-self-start w-full max-w-md flex flex-col">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Language</h2>
            <LanguagePills defaultCode={language} onChange={setLanguage} />
          </div>

          <div className="flex gap-2 mt-6 lg:mt-auto">
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
            <button
              onClick={onPersonalise}
              disabled={submitting || loading}
              className="flex-1 bg-brand-gradient-r text-white text-base font-semibold rounded-xl py-3 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Personalising…' : type === 'videos' ? 'Personalise This Video' : 'Personalise This Card'}
            </button>
          </div>
        </div>
      </div>
      {submitting && <Loader label={type === 'videos' ? 'Personalising your video…' : 'Personalising your card…'} />}
    </Layout>
  );
}
