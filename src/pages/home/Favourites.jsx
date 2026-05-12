import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import VideoThumbnail from '../../components/catalog/VideoThumbnail';
import CardThumbnail from '../../components/catalog/CardThumbnail';
import { useApi } from '../../hooks/useApi';
import { getCardListingService } from '../../services/card.service';
import { notify } from '../../utils/notify';

// /cardlisting with favourite:"1" returns the user's saved items.
// `type` switches between video and card favourites.

export default function Favourites() {
  const [tab, setTab]                  = useState('videos');
  const { data, loading, error, run }  = useApi(getCardListingService);

  useEffect(() => {
    run({ categorykey: '', favourite: '1', type: tab });
  }, [tab, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items)   ? data.items
              : Array.isArray(data?.cards)   ? data.cards
              : Array.isArray(data?.listing) ? data.listing
              : Array.isArray(data)          ? data
              : [];

  return (
    <Layout active="favourites" title="Favourites" loading={!data && !error}>
      <div className="border-b border-slate-200 flex gap-6 mb-6">
        <button
          type="button"
          onClick={() => setTab('videos')}
          className={`-mb-px py-3 px-1 text-sm font-semibold text-slate-500 border-b-2 border-transparent${tab === 'videos' ? ' is-active' : ''}`}
          data-tab="videos"
        >Videos</button>
        <button
          type="button"
          onClick={() => setTab('cards')}
          className={`-mb-px py-3 px-1 text-sm font-semibold text-slate-500 border-b-2 border-transparent${tab === 'cards' ? ' is-active' : ''}`}
          data-tab="cards"
        >Cards</button>
      </div>

      {!loading && !items.length ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
          <div className="text-5xl mb-3">💙</div>
          <h2 className="text-lg font-bold text-slate-900">No favourites yet</h2>
          <p className="text-sm text-slate-500 mt-1">Tap the heart on a card or video to save it here.</p>
        </div>
      ) : null}

      <div className="tile-grid">
        {items.map((it) => {
          const isVideo     = tab === 'videos';
          const Comp        = isVideo ? VideoThumbnail : CardThumbnail;
          const templatekey = it.templatekey || it.cardkey || it.id;
          const catKey      = it.categorykey || '';
          const detailHref  = `${isVideo ? '/video-details' : '/card-details'}?templatekey=${encodeURIComponent(templatekey || '')}&categorykey=${encodeURIComponent(catKey)}&type=${encodeURIComponent(tab)}`;
          return (
            <Comp
              key={it.id || templatekey || it.title}
              title={it.title || it.name}
              image={it.image || it.image_path || it.imageLink || it.thumbnail}
              badge={it.is_premium ? '★' : 'FREE'}
              badgeClass={it.is_premium ? 'badge-crown' : 'badge-free'}
              {...(isVideo ? { videoKey: templatekey } : { cardKey: templatekey })}
              isFavourite={true}
              to={detailHref}
            />
          );
        })}
      </div>
    </Layout>
  );
}
