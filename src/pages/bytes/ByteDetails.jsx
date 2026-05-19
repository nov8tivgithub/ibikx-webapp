import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import {
  getBytesDetailsService,
  trackByteClickService,
  trackByteShareService,
} from '../../services/bytes.service';
import { notify } from '../../utils/notify';

export default function ByteDetails() {
  const { key: rawKey }               = useParams();
  const byteskey                      = decodeURIComponent(rawKey || '');
  const { data, error, run }          = useApi(getBytesDetailsService);

  const trackedRef = useRef(false);
  useEffect(() => {
    if (!byteskey) return;
    run(byteskey);
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackByteClickService(byteskey);
    }
  }, [byteskey, run]);

  useEffect(() => { if (error) notify.error(error); }, [error]);

  const byte       = data?.byte || data?.details || data?.data || data || {};
  const title      = byte.title || '';
  const image      = byte.image_path || byte.image || '';
  const time       = byte.date || byte.time || byte.posted_at || '';
  const author     = byte.source || byte.author || '';
  const sourceLogo = byte.source_logo;
  const views      = byte.events?.view?.view_count   ?? byte.views        ?? byte.total_views ?? 0;
  const shares     = byte.events?.share?.share_count ?? byte.shares       ?? 0;
  const body       = byte.description || byte.body || byte.content_html || '';
  const cta        = byte.cta || '';
  const ctaLink    = byte.events?.share?.redirect_link
                   || byte.events?.view?.redirect_link
                   || byte.redirect_link
                   || '';
  const shareUrl   = byte.events?.share?.redirect_link
                   || byte.share_info
                   || (typeof window !== 'undefined' ? window.location.href : '');

  function onShare() {
    if (byteskey) trackByteShareService(byteskey);
    if (navigator.share) {
      navigator.share({ title: title || 'Idea Byte', url: shareUrl }).catch(() => {});
    }
  }

  return (
    <Layout active="bytes" title="Idea Bytes" back loading={!data && !error}>
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
        <div>
          {image ? (
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 mb-5">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          ) : null}
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-900 leading-tight mb-5">{title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold overflow-hidden">
                {sourceLogo
                  ? <img src={sourceLogo} alt={author || ''} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : 'm'}
              </span>
              {author ? <span className="text-sm font-semibold text-slate-700">{author}</span> : null}
            </span>
            {time ? <><span className="text-slate-300">·</span><span className="text-xs text-slate-500">{time}</span></> : null}
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
          ) : null}
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
