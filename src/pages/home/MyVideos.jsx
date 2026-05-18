import { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/common/StatCard';
import VideoThumbnail from '../../components/catalog/VideoThumbnail';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getCardListingService } from '../../services/card.service';
import { notify } from '../../utils/notify';

// Backend treats "my_videos" as the categorykey for the My Videos listing —
// matches the sub-tile categorykey under the Free Templates parent on the
// dashboard. Response shape:
//   data.category                          → page title
//   data.cards[]                           → grid items (no `title` field on cards)
//   data.show_credit ("1" | "0")            → toggles the credit stats row
//   data.total_video_credits[_label]       → "Total Credits Purchased" stat
//   data.total_personalised_credits[_label] → "Credits Used" stat
//   data.remaining_video_credits[_label]   → "Remaining Credits" stat
export default function MyVideos() {
  const { data, loading, error } = useApiOnMount(getCardListingService, [
    { categorykey: 'my_videos', favourite: '0', type: 'videos' },
  ]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const title = data?.category || 'My Videos';
  const items = Array.isArray(data?.cards)   ? data.cards
              : Array.isArray(data?.items)   ? data.items
              : Array.isArray(data?.videos)  ? data.videos
              : Array.isArray(data?.listing) ? data.listing
              : Array.isArray(data)          ? data
              : [];

  const showCredits = data?.show_credit === '1' || data?.show_credit === 1;
  const totalLabel = data?.total_video_credits        || 'Total Credits Purchased';
  const totalValue = data?.total_video_credits_label;
  const usedLabel  = data?.total_personalised_credits || 'Credits Used';
  const usedValue  = data?.total_personalised_credits_label;
  const leftLabel  = data?.remaining_video_credits    || 'Remaining Credits';
  const leftValue  = data?.remaining_video_credits_label;
  const fmt = (v) => (v === null || v === undefined ? '–' : String(v));

  return (
    <Layout active="home" title={title} back loading={!data && !error}>
      {showCredits ? (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard value={fmt(totalValue)} label={totalLabel} />
          <StatCard value={fmt(usedValue)}  label={usedLabel} />
          <StatCard value={fmt(leftValue)}  label={leftLabel} />
        </div>
      ) : null}
      <div className="tile-grid">
        {items.map((v) => {
          const templatekey = v.templatekey || v.videokey || v.id;
          const isFav       = v.favourite === '1' || v.favourite === 1 || v.is_favourite === '1' || !!v.is_favourite;
          return (
            <VideoThumbnail
              key={v.id || v.cardid || templatekey}
              title={v.title || v.name || ''}
              image={v.imageLink || v.image || v.image_path || v.thumbnail}
              badge={v.is_free === 1 || v.is_free === '1' ? 'FREE' : 'CROWN'}
              badgeClass={v.is_free === 1 || v.is_free === '1' ? 'badge-free' : ''}
              videoKey={templatekey}
              isFavourite={isFav}
              to={`/video-details/${encodeURIComponent(templatekey || '')}?type=videos`}
            />
          );
        })}
      </div>
    </Layout>
  );
}
