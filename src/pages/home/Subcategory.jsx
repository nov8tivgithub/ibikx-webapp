import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import NoRecords from '../../components/common/NoRecords';
import VideoThumbnail from '../../components/catalog/VideoThumbnail';
import CardThumbnail from '../../components/catalog/CardThumbnail';
import { getCardListingService } from '../../services/card.service';
import { notify } from '../../utils/notify';

// `data.has_load_more === "1"` plus `data.last_id` drive paginated load-more.
// We accumulate items across pages in local state and call /cardlisting again
// with `last_id` whenever the sentinel below the grid scrolls into view.
export default function Subcategory() {
  const { catKey: rawCat, subKey: rawSub } = useParams();
  const cat = decodeURIComponent(rawCat || '');
  const sub = decodeURIComponent(rawSub || '');
  const leafKey = sub || cat;
  // ?favourite=1 propagates favourites context from the Favourites page.
  const [search] = useSearchParams();
  const favourite = search.get('favourite') === '1' ? '1' : '0';

  const [tab, setTab]                 = useState('videos');
  const [data, setData]               = useState(null);   // latest response envelope
  const [items, setItems]             = useState([]);     // accumulated cards
  const [lastId, setLastId]           = useState('');
  const [hasMore, setHasMore]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const abortRef    = useRef(null);
  const sentinelRef = useRef(null);
  // Latest filters so a stale in-flight request can't pollute fresh state.
  const reqIdRef    = useRef(0);

  // Reset + load the first page whenever tab, leafKey, or favourite change.
  useEffect(() => {
    if (!leafKey) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const reqId = ++reqIdRef.current;

    setLoading(true);
    setItems([]);
    setLastId('');
    setHasMore(false);
    setData(null);

    getCardListingService(
      { categorykey: leafKey, favourite, type: tab, last_id: '' },
      controller.signal,
    ).then((res) => {
      if (reqId !== reqIdRef.current) return; // a newer request superseded us
      if (res?.status === 1 || res?.status === '1') {
        const d = res.data || {};
        setData(d);
        setItems(Array.isArray(d.cards) ? d.cards : []);
        setLastId(d.last_id ?? '');
        setHasMore(d.has_load_more === '1' || d.has_load_more === 1);
      } else if (res?.name !== 'CanceledError') {
        notify.error(res?.message || 'Failed to load');
      }
      setLoading(false);
    });

    return () => controller.abort();
  }, [tab, leafKey, favourite]);

  // Next-page fetch, appending into items.
  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore || !leafKey) return;
    const reqId = reqIdRef.current; // capture; if it changes, throw out the result
    setLoadingMore(true);
    getCardListingService(
      { categorykey: leafKey, favourite, type: tab, last_id: lastId },
    ).then((res) => {
      if (reqId !== reqIdRef.current) return;
      if (res?.status === 1 || res?.status === '1') {
        const d = res.data || {};
        setItems((prev) => prev.concat(Array.isArray(d.cards) ? d.cards : []));
        setLastId(d.last_id ?? lastId);
        setHasMore(d.has_load_more === '1' || d.has_load_more === 1);
      } else if (res?.name !== 'CanceledError') {
        notify.error(res?.message || 'Failed to load more');
      }
      setLoadingMore(false);
    });
  }, [hasMore, lastId, leafKey, loading, loadingMore, tab, favourite]);

  // Watch the sentinel — when it enters the viewport, request the next page.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px 0px' }, // start loading a bit before the sentinel enters
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  // /cardlisting returns the page title in `data.category`. No default
  // fallback — the header stays empty until the response lands rather than
  // flashing a placeholder like "Subcategory" or a stray "> name".
  const title = data?.category
    || (data?.subcategoryname
          ? (data.categoryname ? `${data.categoryname} > ${data.subcategoryname}` : data.subcategoryname)
          : '');

  // Tab strip is gated solely on `isShowtypeTab`. When the backend says to
  // show tabs but doesn't supply any, fall back to the default Videos / Cards.
  const showTabs = data?.isShowtypeTab === '1' || data?.isShowtypeTab === 1;
  const apiTabs  = Array.isArray(data?.dashboard_tabs) ? data.dashboard_tabs : [];
  const tabs     = apiTabs.length ? apiTabs : [
    { title: 'Videos', type: 'videos' },
    { title: 'Cards',  type: 'cards'  },
  ];

  // Keep the Favourites sidebar item highlighted when we arrived via the
  // ?favourite=1 chain from the Favourites page.
  const sidebarActive = favourite === '1' ? 'favourites' : 'home';

  return (
    <Layout active={sidebarActive} title={title} back loading={loading && !data}>
      {showTabs ? (
        <div className="border-b border-slate-200 flex gap-6 mb-6">
          {tabs.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => { if (tab !== t.type) setTab(t.type); }}
              className={`-mb-px py-3 px-1 text-sm font-semibold text-slate-500 border-b-2 border-transparent${tab === t.type ? ' is-active' : ''}`}
              data-tab={t.type}
            >
              {t.title}
            </button>
          ))}
        </div>
      ) : null}

      {!loading && !items.length ? <NoRecords /> : null}

      <div className="tile-grid">
        {items.map((it) => {
          const isVideo     = tab === 'videos' || it.is_video === '1' || it.is_video === 1 || it.type === 'video';
          const Comp        = isVideo ? VideoThumbnail : CardThumbnail;
          const templatekey = it.templatekey || it.cardkey || it.id;
          const detailHref  = `${isVideo ? '/video-details' : '/card-details'}/${encodeURIComponent(templatekey || '')}?type=${encodeURIComponent(tab)}&categorykey=${encodeURIComponent(leafKey)}`;
          const isFav       = it.favourite === '1' || it.favourite === 1 || !!it.is_favourite;
          const isFree = it.is_free === 1 || it.is_free === '1';
          // Badges are video-only. Cards (is_video !== "1") never show one.
          // 'FREE' → white pill, 'CROWN' → gold crown SVG (no pill).
          const badge      = isVideo ? (isFree ? 'FREE' : 'CROWN') : '';
          const badgeClass = badge === 'FREE' ? 'badge-free' : '';
          return (
            <Comp
              key={it.id || it.cardid || templatekey || it.title}
              title={it.title || it.name || ''}
              image={it.imageLink || it.image || it.image_path || it.thumbnail}
              badge={badge}
              badgeClass={badgeClass}
              {...(isVideo ? { videoKey: templatekey } : { cardKey: templatekey })}
              isFavourite={isFav}
              to={detailHref}
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
