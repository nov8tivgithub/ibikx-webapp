import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import { getCertificateViewService } from '../../services/certificate.service';
import { notify } from '../../utils/notify';

// PDF / preview viewer for a single certificate. The backend returns either a
// hosted URL (pdf_url / url) or base64 — we embed via an <iframe> for PDFs
// and an <img> for image certificates. A native "Open in new tab" download
// fallback is offered for offline storage.

export default function CertificateView() {
  const [params]                       = useSearchParams();
  const id                             = params.get('id') || '';
  const { data, loading, error, run }  = useApi(getCertificateViewService);

  useEffect(() => { if (id) run(id); }, [id, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const url      = data?.pdf_url || data?.url || data?.file_url;
  const isPdf    = url && /\.pdf(\?|$)/i.test(url);
  const title    = data?.title || 'Certificate';

  return (
    <Layout active="profile" title={title} back loading={!data && !error}>
      {!url && !loading ? (
        <p className="text-sm text-slate-500">Certificate file is not available.</p>
      ) : null}

      {url ? (
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
            {isPdf ? (
              <iframe
                src={url}
                title={title}
                className="w-full"
                style={{ height: 'calc(100vh - 14rem)' }}
              />
            ) : (
              <img src={url} alt={title} className="w-full h-auto" />
            )}
          </div>
          <div className="flex gap-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >Open in new tab</a>
            <a
              href={url}
              download
              className="px-4 py-2 rounded-lg bg-brand-gradient-r text-white text-sm font-semibold"
            >Download</a>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
