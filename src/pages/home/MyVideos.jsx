import { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import VideoThumbnail from '../../components/catalog/VideoThumbnail';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getCardListingService } from '../../services/card.service';
import { notify } from '../../utils/notify';

// No dedicated /myvideos endpoint in the captured payloads — filtered /cardlisting.
export default function MyVideos() {
  const { data, loading, error } = useApiOnMount(getCardListingService, [
    { categorykey: '', favourite: '1', type: 'videos' },
  ]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items)   ? data.items
              : Array.isArray(data?.videos)  ? data.videos
              : Array.isArray(data?.cards)   ? data.cards
              : Array.isArray(data?.listing) ? data.listing
              : Array.isArray(data)          ? data
              : [];
  const stats = data?.stats || {};
  const total = stats.total     ?? stats.purchased ?? '–';
  const used  = stats.used      ?? '–';
  const left  = stats.remaining ?? stats.left      ?? '–';

  return (
    <Layout active="home" title="My Videos" back loading={!data && !error}>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard value={String(total)} label="Total Credits Purchased" />
        <StatCard value={String(used)} label="Credits Used" />
        <StatCard value={String(left)} label="Remaining Credits" />
      </div>
      <div className="tile-grid">
        {items.map((v) => {
          const templatekey = v.templatekey || v.videokey || v.id;
          return (
            <VideoThumbnail
              key={v.id || templatekey || v.title}
              title={v.title || v.name}
              image={v.image || v.image_path || v.imageLink || v.thumbnail}
              badge={v.is_premium ? '★' : 'FREE'}
              badgeClass={v.is_premium ? 'badge-crown' : 'badge-free'}
              videoKey={templatekey}
              isFavourite={!!v.is_favourite}
              to={`/video-details?templatekey=${encodeURIComponent(templatekey || '')}&categorykey=${encodeURIComponent(v.categorykey || '')}&type=videos`}
            />
          );
        })}
      </div>
    </Layout>
  );
}
