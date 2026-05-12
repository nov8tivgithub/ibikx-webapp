import { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import VideoThumbnail from '../../components/catalog/VideoThumbnail';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getCardListingService } from '../../services/card.service';
import { notify } from '../../utils/notify';

// No dedicated /freevideos endpoint — filtered listing off /cardlisting.
// Adjust the param shape once backend confirms a "free" flag.
export default function FreeVideos() {
  const { data, loading, error } = useApiOnMount(getCardListingService, [
    { categorykey: '', favourite: '0', type: 'videos' },
  ]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items)   ? data.items
              : Array.isArray(data?.videos)  ? data.videos
              : Array.isArray(data?.cards)   ? data.cards
              : Array.isArray(data?.listing) ? data.listing
              : Array.isArray(data)          ? data
              : [];

  return (
    <Layout active="home" title="Free Videos" back loading={!data && !error}>
      <div className="tile-grid">
        {items.map((v) => {
          const templatekey = v.templatekey || v.videokey || v.id;
          return (
            <VideoThumbnail
              key={v.id || templatekey || v.title}
              title={v.title || v.name}
              image={v.image || v.image_path || v.imageLink || v.thumbnail}
              badge="FREE"
              badgeClass="badge-free"
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
