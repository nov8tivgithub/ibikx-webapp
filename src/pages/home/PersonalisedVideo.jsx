import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';

export default function PersonalisedVideo() {
  const [fav, setFav] = useState(false);
  const { user }     = useAuth();
  const location     = useLocation();
  const personalised = location.state?.personalised || {};
  const source       = location.state?.source       || {};

  // Backend returns either a hosted MP4 / HLS URL, or a poster + watermark info.
  const videoUrl   = personalised.video_url || personalised.url;
  const posterUrl  = personalised.poster || personalised.preview_image || source.preview_image
                    || 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800';
  const title      = source.title || personalised.title || "Secure Your Family's Tomorrow";
  const advisor    = user?.name || `${user?.first_name || 'David'} ${user?.last_name || 'John'}`.trim();
  const phone      = user?.phone || '8075758209';

  function onShare() {
    if (navigator.share) {
      navigator.share({ title, url: videoUrl || window.location.href }).catch(() => {});
    }
  }

  return (
    <Layout active="home" title={source.breadcrumb || personalised.breadcrumb || 'Plan Based > Retirement'} back>
      <div className="relative max-w-md mx-auto">
        <div className="rounded-3xl overflow-hidden bg-black/90 shadow-2xl relative aspect-[3/4]">
          {videoUrl ? (
            <video
              src={videoUrl}
              poster={posterUrl}
              controls
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <img
                src={posterUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <button className="w-20 h-20 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
                </button>
              </span>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-white">
            <p className="text-xs opacity-90">{advisor} · Life/Health Advisor</p>
            <p className="text-sm font-semibold mt-1">{title}</p>
            <p className="text-[11px] opacity-90">{phone} · LIC of India</p>
          </div>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-2 lg:-right-16 flex flex-col gap-3">
          <button
            onClick={() => setFav((v) => !v)}
            className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center hover:scale-105 transition"
            aria-label="Save"
          >
            <svg className="w-5 h-5" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button onClick={onShare} className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-slate-700 hover:scale-105 transition" aria-label="Share">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l18-9-7 18-2-7-9-2z" />
            </svg>
          </button>
          <button onClick={onShare} className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition" aria-label="Send on WhatsApp">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1s-.7.9-.8 1c-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4 1.7.7 2.4.8 3.3.6.5-.1 1.6-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" /></svg>
          </button>
        </div>
      </div>
    </Layout>
  );
}
