import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import NoRecords from '../../components/common/NoRecords';
import ScrollRow from '../../components/common/ScrollRow';
import CategoryTile from '../../components/catalog/CategoryTile';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getFavouritesService } from '../../services/card.service';
import { subLink } from '../../data/categories';
import { notify } from '../../utils/notify';

// Append ?favourite=1 to a generated link so the destination listing page
// knows to filter to favourites. Handles both bare paths and override paths
// that may already include a query string (e.g. "/free-videos").
function asFavouriteLink(href) {
  if (!href) return href;
  const sep = href.includes('?') ? '&' : '?';
  return `${href}${sep}favourite=1`;
}

// One category row (mirrors the dashboard's ApiCategorySection — same shape,
// but every link is tagged with ?favourite=1 so the destination filters).
function FavouriteCategoryRow({ category }) {
  const subs = Array.isArray(category?.sub_categories) ? category.sub_categories : [];
  if (!subs.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <h2 className="text-lg lg:text-xl font-bold text-slate-900">{category.categoryname}</h2>
        {category.show_viewmore ? (
          <Link
            to={asFavouriteLink(`/category/${encodeURIComponent(category.categorykey)}`)}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue/10 hover:bg-brand-blue/20 px-2.5 py-1 rounded-full transition"
          >
            View all
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ) : null}
      </div>
      <ScrollRow>
        {subs.map((sub) => (
          <CategoryTile
            key={sub.categoryid}
            title={sub.categoryname}
            image={sub.imageLink}
            to={asFavouriteLink(subLink(category.categorykey, sub.categorykey))}
          />
        ))}
      </ScrollRow>
    </div>
  );
}

// /myfavourites returns the user's saved templates grouped by category —
// shape matches the dashboard's `categories` array, so the page renders as
// the same set of scroll-rows.
export default function Favourites() {
  const { data, loading, error } = useApiOnMount(getFavouritesService, [{ type: '' }]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const title      = data?.title || 'Favourites';
  const categories = Array.isArray(data?.categories) ? data.categories : [];

  return (
    <Layout active="favourites" title={title} loading={!data && !error}>
      {!loading && !categories.length ? (
        <NoRecords />
      ) : (
        <div className="space-y-6">
          {categories.map((c) => (
            <FavouriteCategoryRow key={c.categoryid} category={c} />
          ))}
        </div>
      )}
    </Layout>
  );
}
