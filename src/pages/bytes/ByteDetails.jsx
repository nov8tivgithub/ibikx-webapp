import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import {
  getBytesDetailsService,
  trackByteClickService,
  trackByteShareService,
} from '../../services/bytes.service';
import { notify } from '../../utils/notify';

export default function ByteDetails() {
  const [params]                      = useSearchParams();
  const bytekey                       = params.get('key') || '';
  const { data, loading, error, run } = useApi(getBytesDetailsService);

  const trackedRef = useRef(false);
  useEffect(() => {
    if (!bytekey) return;
    run(bytekey);
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackByteClickService(bytekey); // fire-and-forget
    }
  }, [bytekey, run]);

  useEffect(() => { if (error) notify.error(error); }, [error]);

  function onShare() {
    if (bytekey) trackByteShareService(bytekey);
    if (navigator.share) {
      navigator.share({ title: data?.title || 'Idea Byte', url: window.location.href }).catch(() => {});
    }
  }

  const title      = data?.title || 'Centre clears 100% automatic FDI in insurance, LIC cap stays at 20%';
  const image      = data?.image_path || data?.image || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600';
  const time       = data?.date || data?.time || data?.posted_at || '3 days ago';
  const author     = data?.source || data?.author || 'Mobilix Editorial';
  const sourceLogo = data?.source_logo;
  const views      = data?.events?.view?.view_count   ?? data?.views  ?? 0;
  const shares     = data?.events?.share?.share_count ?? data?.shares ?? 0;
  const body       = data?.description || data?.body || data?.content_html || null;
  const cta        = data?.cta || '';
  const ctaLink    = data?.redirect_link;
  const fallback = [
    'The Finance Ministry issued a Gazette notification (dated May 2, 2026) formalising changes to the Foreign Exchange Management (Non-debt Instruments) Rules that permit up to 100% foreign direct investment in Indian insurance companies and intermediaries via the automatic route.',
    'The move covers insurers and a broad set of intermediaries — brokers, reinsurance brokers, consultants, corporate agents, TPAs, surveyors and loss assessors, MGAs and repositories — while retaining IRDAI oversight and requiring compliance with the Insurance Act, 1938.',
    "A special exception keeps Life Insurance Corporation of India's automatic-route cap at 20%. Governance safeguards include a requirement that at least one of the chairperson, MD or CEO be an Indian resident.",
  ];

  return (
    <Layout active="bytes" title="Idea Bytes" back loading={!data && !error}>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
        <div>
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 mb-5">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight mb-5">{title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                {sourceLogo
                  ? <img src={sourceLogo} alt={author || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : 'm'}
              </span>
              <span className="text-sm font-semibold text-slate-700">{author}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{time}</span>
            <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-8 10.5-8 10.5 8 10.5 8-4 8-10.5 8S1.5 12 1.5 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {views} views
              </span>
              <button type="button" onClick={onShare} className="inline-flex items-center gap-1 hover:text-brand-blue">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
                </svg>
                {shares} shares
              </button>
            </span>
          </div>
        </div>

        <div>
          {body ? (
            <article
              className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <article className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-base">
              {fallback.map((p, i) => <p key={i}>{p}</p>)}
            </article>
          )}
          <div className="mt-8 flex items-center gap-3">
            <button onClick={onShare} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: '#1e9bff' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
              </svg>
              Share
            </button>
            {ctaLink ? (
              <a
                href={ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                {cta || 'Read more'}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Layout>
  );
}
