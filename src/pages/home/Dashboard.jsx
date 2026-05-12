import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CoverCarousel from '../../components/common/CoverCarousel';
import ScrollRow from '../../components/common/ScrollRow';
import CategoryTile from '../../components/catalog/CategoryTile';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { getDashboardService } from '../../services/catalog.service';
import { notify } from '../../utils/notify';

// Fallback tabs used until the API responds (or if the field is missing).
const FALLBACK_TABS = [
  { title: 'Videos', type: 'videos' },
  { title: 'Cards',  type: 'cards' },
];

const PLAY_SVG = (
  <span className="absolute inset-0 flex items-center justify-center">
    <span className="w-14 h-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white">
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
    </span>
  </span>
);

// One slide rendered inside the cover carousel — driven by an API card object.
function FeaturedSlide({ card, type }) {
  const image       = card.image_path || card.image || card.preview_image || card.thumbnail;
  const title       = card.title || card.name || '';
  const premium     = card.is_premium === '1' || card.is_premium === 1 || !!card.is_premium;
  const badge       = premium ? '★ Premium' : 'FREE';
  const badgeCls    = premium ? 'badge-crown' : 'badge-free';
  const templatekey = card.templatekey || card.key || card.cardkey || card.videokey || card.id;
  const categorykey = card.categorykey || '';
  const path        = type === 'videos' ? '/video-details' : '/card-details';
  const to          = `${path}?templatekey=${encodeURIComponent(templatekey || '')}&categorykey=${encodeURIComponent(categorykey)}&type=${encodeURIComponent(type)}`;

  return (
    <Link to={to} className="block w-full h-full relative bg-slate-200">
      {image ? (
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : null}
      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${badgeCls}`}>{badge}</span>
      {type === 'videos' ? PLAY_SVG : null}
      <span className="absolute bottom-3 left-3 right-3 text-white font-semibold drop-shadow text-sm">{title}</span>
    </Link>
  );
}

// Inline spinner used while a tab switch is re-fetching — keeps the page
// shell + greeting + menu list visible and only loaders the parts of the
// page that actually change (carousel + category rows).
function SectionSpinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="loader-spinner" aria-hidden="true" />
    </div>
  );
}

// Empty-state for when the API returns no featured cards/videos for the tab.
function NoRecords() {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <svg className="w-40 h-40 text-brand-blue" fill="none" viewBox="0 0 200 200" aria-hidden="true">
        <rect x="42"  y="40"  width="86" height="100" rx="6" stroke="currentColor" strokeWidth="3" fill="white" transform="rotate(-7 85 90)" />
        <rect x="78"  y="60"  width="86" height="100" rx="6" stroke="currentColor" strokeWidth="3" fill="white" />
        <circle cx="100" cy="92" r="8" fill="currentColor" opacity="0.18" />
        <path d="M82 132 L106 110 L124 124 L142 110 L160 132 Z" fill="currentColor" opacity="0.18" />
        <path d="M30 110 h22 M28 130 h28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
        <path d="M170 80 h22 M168 100 h28" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <p className="mt-4 text-xl font-bold text-slate-900">No Records Found</p>
    </div>
  );
}

// Action cards from data.menuList. menuColor is the row background; key is the
// destination URL. Cards wrap into a responsive grid — single column on mobile,
// two on small screens, three on large.
function MenuList({ items }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {items.map((m) => (
        <a
          key={m.title}
          href={m.key}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 px-4 py-4 rounded-2xl border border-slate-200 shadow-soft hover:shadow-md transition"
          style={{ backgroundColor: m.menuColor || '#ffffff' }}
        >
          {m.iconUrl ? (
            <img
              src={m.iconUrl}
              alt=""
              className="w-12 h-12 object-contain shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span className="w-12 h-12 rounded-full bg-slate-100" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-slate-900 truncate">{m.title}</p>
            {m.desc ? <p className="text-xs text-slate-500 mt-0.5 truncate">{m.desc}</p> : null}
          </div>
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
          </svg>
        </a>
      ))}
    </div>
  );
}

// Renders one category row from the /dashboardnew response.
function ApiCategorySection({ category }) {
  const subs = Array.isArray(category?.sub_categories) ? category.sub_categories : [];
  if (!subs.length) return null;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg lg:text-xl font-bold text-slate-900">{category.categoryname}</h2>
        {category.show_viewmore ? (
          <Link
            to={`/category?cat=${encodeURIComponent(category.categorykey)}&name=${encodeURIComponent(category.categoryname)}`}
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            View All
          </Link>
        ) : null}
      </div>
      <ScrollRow>
        {subs.map((sub) => (
          <CategoryTile
            key={sub.categoryid}
            title={sub.categoryname}
            image={sub.imageLink}
            to={`/subcategory?cat=${encodeURIComponent(category.categorykey)}&sub=${encodeURIComponent(sub.categorykey)}&name=${encodeURIComponent(sub.categoryname)}`}
          />
        ))}
      </ScrollRow>
    </div>
  );
}

export default function Dashboard() {
  // Default tab is "videos". Each switch refetches with the new `type`.
  const [type, setType]                  = useState('videos');
  const { data, loading, error, run }    = useApi(getDashboardService);
  const { user, refreshUser }            = useAuth();

  useEffect(() => { run(type); }, [type, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  // Merge userinfo (imagelink, title, description) into the stored user.
  useEffect(() => {
    const ui = data?.userinfo;
    if (!ui) return;
    const unchanged =
      (ui.imagelink   ?? null) === (user?.imagelink   ?? null) &&
      (ui.title       ?? null) === (user?.title       ?? null) &&
      (ui.description ?? null) === (user?.description ?? null);
    if (unchanged) return;
    refreshUser({ ...(user || {}), ...ui });
  }, [data, user, refreshUser]);

  // Tabs in the order the API returns them.
  const tabs = Array.isArray(data?.dashboard_tabs) && data.dashboard_tabs.length
    ? data.dashboard_tabs
    : FALLBACK_TABS;

  const userinfo   = data?.userinfo;
  const cards      = Array.isArray(data?.cards) ? data.cards : [];
  const menuList   = Array.isArray(data?.menuList) ? data.menuList : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];

  return (
    <Layout active="home" title="Home" loading={!data && !error}>
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {userinfo?.imagelink ? (
            <img
              src={userinfo.imagelink}
              alt=""
              className="w-12 h-12 rounded-full object-cover bg-slate-200"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : null}
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              {userinfo?.title || (loading ? 'Loading…' : 'Hi 👋')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {userinfo?.description || 'Explore our templates'}
            </p>
          </div>
        </div>
        <div className="segmented inline-flex bg-slate-100 rounded-full p-1 shadow-soft">
          {tabs.map((t) => (
            <button
              key={t.type}
              type="button"
              className={`py-2 px-6 rounded-full text-sm font-semibold text-slate-600${type === t.type ? ' is-active' : ''}`}
              data-tab={t.type}
              disabled={loading && type !== t.type}
              onClick={() => { if (type !== t.type) setType(t.type); }}
            >
              {t.title}
            </button>
          ))}
        </div>
      </section>

      {/* Everything below the greeting + tabs is tab-specific. A single
          SectionSpinner replaces the entire block while a tab switch
          re-fetches /dashboardnew. */}
      {loading ? (
        <SectionSpinner />
      ) : (
        <div>
          {/* Featured carousel or empty state. */}
          {cards.length === 0 ? (
            <NoRecords />
          ) : (
            <CoverCarousel
              ariaLabel={type === 'videos' ? 'Featured videos' : 'Featured cards'}
              slides={cards.map((c) => (
                <FeaturedSlide key={c.key || c.cardkey || c.videokey || c.id} card={c} type={type} />
              ))}
            />
          )}

          {/* Menu list (top-level field — same for both tabs but reloads with the response). */}
          <MenuList items={menuList} />

          {/* Videos tab only — My / Free Videos shortcut row. */}
          {type === 'videos' ? (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Videos</h3>
              <ScrollRow className="mb-8">
                <Link to="/my-videos" className="thumb relative block aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 shadow-soft">
                  <img src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600" alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white font-semibold">My Videos</span>
                </Link>
                <Link to="/free-videos" className="thumb relative block aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 shadow-soft">
                  <img src="https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=600" alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white font-semibold">Free Videos</span>
                </Link>
              </ScrollRow>
            </>
          ) : null}

          {/* Category rows. */}
          <div className="space-y-8">
            {categories.map((c) => (
              <ApiCategorySection key={c.categoryid} category={c} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
