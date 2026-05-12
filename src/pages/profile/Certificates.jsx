import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getCertificateListService } from '../../services/certificate.service';
import { notify } from '../../utils/notify';

export default function Certificates() {
  const { data, loading, error } = useApiOnMount(getCertificateListService);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items) ? data.items
              : Array.isArray(data?.certificates) ? data.certificates
              : Array.isArray(data) ? data
              : [];

  if (loading && !data) {
    return <Layout active="profile" title="Certificates" back loading />;
  }

  if (!items.length) {
    return (
      <Layout active="profile" title="Certificates" back>
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <img
            src={`${import.meta.env.BASE_URL}assets/img/certificate-placeholder.jpg`}
            alt=""
            className="w-28 h-32 mx-auto object-contain opacity-70"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h2 className="text-lg font-bold text-slate-900 mt-4">No certificates yet</h2>
          <p className="text-sm text-slate-500 mt-1">Win quizzes and complete training modules to earn your first certificate.</p>
          <Link to="/quiz" className="inline-block mt-5 px-4 py-2 rounded-lg bg-brand-gradient-r text-white text-sm font-semibold">
            Try the daily quiz
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout active="profile" title="Certificates" back>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => {
          const id = c.id || c.certificate_id || c.key;
          return (
            <Link
              key={id}
              to={`/certificate-view?id=${encodeURIComponent(id)}`}
              className="block rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-md transition"
            >
              <div className="aspect-[4/3] bg-slate-100">
                <img
                  src={c.thumbnail || c.image || `${import.meta.env.BASE_URL}assets/img/certificate-placeholder.jpg`}
                  alt={c.title || 'Certificate'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-900 text-sm">{c.title || 'Certificate'}</p>
                <p className="text-xs text-slate-500 mt-1">{c.date || c.issued_on || ''}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}
