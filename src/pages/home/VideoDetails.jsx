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
  markAsFavouriteService,
} from '../../services/card.service';
import { notify } from '../../utils/notify';

// The captured backend uses the same /carddetails endpoint for both video and
// card detail pages — the `type` parameter discriminates. The standalone
// /viewvideo / /personalizevideo services exist in video.service.js for any
// future endpoint that splits them again.

const LANG_TO_ID = { en: 0, hi: 1, ml: 2, ta: 3, gu: 4 };

export default function VideoDetails() {
  const navigate                       = useNavigate();
  const [params]                       = useSearchParams();
  const templatekey                    = params.get('templatekey') || params.get('key') || '';
  const categorykey                    = params.get('categorykey') || '';
  const type                           = params.get('type') || 'videos';
  const [language, setLanguage]        = useState('en');
  const [submitting, setSubmitting]    = useState(false);
  const [fav, setFav]                  = useState(false);

  const { data, loading, error, run }  = useApi(getCardDetailsService);
  const personalize                    = useApi(personalizeCardService);

  useEffect(() => {
    if (!templatekey) return;
    run({ templatekey, categorykey, favourite: '0', languageid: LANG_TO_ID[language] ?? 0, type });
  }, [templatekey, categorykey, type, language, run]);

  const viewedRef = useRef(false);
  useEffect(() => {
    const cardkey = data?.cardkey;
    if (!cardkey || viewedRef.current) return;
    viewedRef.current = true;
    recordCardViewService({ cardkey, languageid: LANG_TO_ID[language] ?? 0, type });
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
      navigate('/personalised-video', { state: { personalised: res.data, source: data } });
    } else {
      notify.error(res?.message || 'Could not personalise this video.');
    }
  }

  function onToggleFav() {
    if (!templatekey) return;
    const next = !fav;
    setFav(next);
    markAsFavouriteService({ templatekey, cardkey: data?.cardkey, value: next ? '1' : '0', type });
  }

  const title       = data?.title       || 'Video details';
  const previewImg  = data?.preview_image || data?.image || data?.image_path || 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800';
  const breadcrumb  = data?.breadcrumb  || data?.title || 'Plan Based > Retirement';
  const isPremium   = !!data?.is_premium;

  return (
    <Layout active="home" title={breadcrumb} back loading={!data && !error}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div className="lg:justify-self-end w-full max-w-md">
          <div className="rounded-3xl overflow-hidden bg-black/90 shadow-soft relative aspect-[3/4]">
            <img
              src={previewImg}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${isPremium ? 'badge-crown' : 'badge-free'}`}>
              {isPremium ? '★ Premium' : 'FREE'}
            </span>
            <span className="absolute inset-0 flex items-center justify-center">
              <button className="w-20 h-20 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
              </button>
            </span>
            <div className="absolute left-4 right-4 bottom-4 h-1 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full w-1/12 bg-white" />
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
              onClick={onPersonalise}
              disabled={submitting || loading}
              className="flex-1 bg-brand-gradient-r text-white text-base font-semibold rounded-xl py-3 shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Personalising…' : 'Personalise This Video'}
            </button>
          </div>
        </div>
      </div>
      {submitting && <Loader label="Personalising your video…" />}
    </Layout>
  );
}
