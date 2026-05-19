import { useCallback, useEffect, useRef, useState } from 'react';
import Layout from '../../components/layout/Layout';
import ByteListItem from '../../components/bytes/ByteListItem';
import PopularBytesSlider from '../../components/bytes/PopularBytesSlider';
import { getBytesListingService } from '../../services/bytes.service';
import { notify } from '../../utils/notify';

// /bytes/listing is page-numbered. We accumulate items across pages in local
// state and call again with the next page whenever the sentinel below the
// grid scrolls into view. The popular_bytes block is only kept from page 1.
export default function Bytes() {
  const [items, setItems]             = useState([]);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);

  const abortRef    = useRef(null);
  const sentinelRef = useRef(null);

  const pickItems = (d) =>
      Array.isArray(d?.items) ? d.items
    : Array.isArray(d?.bytes) ? d.bytes
    : Array.isArray(d?.list)  ? d.list
    : Array.isArray(d)        ? d
    : [];

  // First page on mount.
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    getBytesListingService(1, controller.signal).then((res) => {
      if (res?.status === 1 || res?.status === '1') {
        const next = pickItems(res.data);
        setItems(next);
        setPage(1);
        const more = res.data?.has_load_more;
        setHasMore(more != null ? (more === '1' || more === 1) : next.length > 0);
      } else if (res?.name !== 'CanceledError') {
        const msg = res?.message || 'Failed to load';
        setError(msg);
        notify.error(msg);
      }
      setLoading(false);
    });

    return () => controller.abort();
  }, []);

  // Next-page fetch, appending into items. Drops the popular_bytes block from
  // any page > 1 — that slider only belongs at the top of the list.
  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getBytesListingService(nextPage).then((res) => {
      if (res?.status === 1 || res?.status === '1') {
        const next = pickItems(res.data).filter((it) => it?.type !== 'popular_bytes');
        setItems((prev) => prev.concat(next));
        setPage(nextPage);
        const more = res.data?.has_load_more;
        setHasMore(more != null ? (more === '1' || more === 1) : next.length > 0);
      } else if (res?.name !== 'CanceledError') {
        notify.error(res?.message || 'Failed to load more');
      }
      setLoadingMore(false);
    });
  }, [hasMore, loading, loadingMore, page]);

  // Watch the sentinel — when it enters the viewport, request the next page.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  return (
    <Layout active="bytes" title="Idea Bytes" loading={loading && !items.length && !error}>
      {!loading && !items.length ? (
        <p className="text-sm text-slate-400">No bytes available right now.</p>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {items.map((it, idx) => {
          if (it.type === 'popular_bytes') {
            return (
              <PopularBytesSlider
                key={`popular-${idx}`}
                items={Array.isArray(it.bytes) ? it.bytes : []}
              />
            );
          }
          const bytekey = it.key || it.bytekey || it.id;
          return (
            <ByteListItem
              key={it.id || bytekey || `${it.title}-${idx}`}
              title={it.title}
              image={it.image_path || it.image || it.imageLink}
              time={it.date || it.time || it.posted_at || ''}
              views={it.events?.view?.view_count   ?? it.views  ?? 0}
              shares={it.events?.share?.share_count ?? it.shares ?? 0}
              excerpt={it.description || it.excerpt || it.summary || ''}
              sourceLogo={it.source_logo}
              sourceName={it.source}
              to={`/bytes/${encodeURIComponent(bytekey || '')}/details`}
            />
          );
        })}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="flex items-center justify-center py-6">
          {loadingMore ? <div className="loader-spinner" aria-hidden="true" /> : null}
        </div>
      ) : null}
    </Layout>
  );
}
