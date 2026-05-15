import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import VideoThumbnail from '../../components/catalog/VideoThumbnail';
import CardThumbnail from '../../components/catalog/CardThumbnail';
import { useApi } from '../../hooks/useApi';
import { getCardListingService } from '../../services/card.service';
import { notify } from '../../utils/notify';

export default function Subcategory() {
  // `catKey` is the parent category key, `subKey` is the leaf sub-category key —
  // the listing endpoint takes the leaf key as `categorykey`.
  const { catKey: rawCat, subKey: rawSub } = useParams();
  const cat                            = decodeURIComponent(rawCat || '');
  const sub                            = decodeURIComponent(rawSub || '');
  const subName                        = 'Subcategory';
  const [tab, setTab]                  = useState('videos');
  const { data, loading, error, run }  = useApi(getCardListingService);

  // Use the leaf categorykey when present, else fall back to the parent.
  const leafKey = sub || cat;

  useEffect(() => {
    if (leafKey) run({ categorykey: leafKey, favourite: '0', type: tab });
  }, [tab, leafKey, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items)    ? data.items
              : Array.isArray(data?.cards)    ? data.cards
              : Array.isArray(data?.listing)  ? data.listing
              : Array.isArray(data)           ? data
              : [];

  const title = data?.subcategoryname
    ? `${data.categoryname || ''} > ${data.subcategoryname}`
    : subName;

  return (
    <Layout active="home" title={title} back loading={!data && !error}>
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
        <p className="text-sm text-slate-400">No {tab} available in this category yet.</p>
      ) : null}

      <div className="tile-grid">
        {items.map((it) => {
          const isVideo     = tab === 'videos';
          const Comp        = isVideo ? VideoThumbnail : CardThumbnail;
          const templatekey = it.templatekey || it.cardkey || it.id;
          const detailHref  = `${isVideo ? '/video-details' : '/card-details'}?templatekey=${encodeURIComponent(templatekey || '')}&categorykey=${encodeURIComponent(leafKey)}&type=${encodeURIComponent(tab)}`;
          return (
            <Comp
              key={it.id || templatekey || it.title}
              title={it.title || it.name}
              image={it.image || it.image_path || it.imageLink || it.thumbnail}
              badge={it.is_premium ? '★' : 'FREE'}
              badgeClass={it.is_premium ? 'badge-crown' : 'badge-free'}
              {...(isVideo ? { videoKey: templatekey } : { cardKey: templatekey })}
              isFavourite={!!it.is_favourite}
              to={detailHref}
            />
          );
        })}
      </div>
    </Layout>
  );
}
