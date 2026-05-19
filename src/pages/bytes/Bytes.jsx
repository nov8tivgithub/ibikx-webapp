import { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import ByteListItem from '../../components/bytes/ByteListItem';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getBytesListingService } from '../../services/bytes.service';
import { notify } from '../../utils/notify';

export default function Bytes() {
  const { data, loading, error } = useApiOnMount(getBytesListingService, [1]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items) ? data.items
              : Array.isArray(data?.bytes) ? data.bytes
              : Array.isArray(data?.list)  ? data.list
              : Array.isArray(data)        ? data
              : [];

  return (
    <Layout active="bytes" title="Idea Bytes" loading={!data && !error}>
      {!loading && !items.length ? (
        <p className="text-sm text-slate-400">No bytes available right now.</p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {items.map((it) => {
          const bytekey = it.key || it.bytekey || it.id;
          return (
            <ByteListItem
              key={it.id || bytekey || it.title}
              title={it.title}
              image={it.image_path || it.image || it.imageLink}
              time={it.date || it.time || it.posted_at || ''}
              views={it.events?.view?.view_count   ?? it.views  ?? 0}
              shares={it.events?.share?.share_count ?? it.shares ?? 0}
              excerpt={it.description || it.excerpt || it.summary || ''}
              sourceLogo={it.source_logo}
              sourceName={it.source}
              to={`/byte-details?key=${encodeURIComponent(bytekey || '')}`}
            />
          );
        })}
      </div>
    </Layout>
  );
}
