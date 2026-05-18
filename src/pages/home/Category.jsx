import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import NoRecords from '../../components/common/NoRecords';
import CategoryTile from '../../components/catalog/CategoryTile';
import { useApi } from '../../hooks/useApi';
import { getCategoryDetailsService } from '../../services/catalog.service';
import { subLink } from '../../data/categories';
import { notify } from '../../utils/notify';

export default function Category() {
  const { catKey: rawKey } = useParams();
  const cat                = decodeURIComponent(rawKey || '');
  const [search]           = useSearchParams();
  // ?favourite=1 → reuse the favourites context for the sub-category drill-in.
  const favourite          = search.get('favourite') === '1' ? '1' : '0';

  const { data, loading, error, run } = useApi(getCategoryDetailsService);

  useEffect(() => { if (cat) run({ categorykey: cat, favourite }); }, [cat, favourite, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  // API shape: { category: "Plan based", subcategory: [ ... ] }
  // Older keys (categoryname / sub_categories / items) kept as fallbacks.
  const title = data?.category || data?.categoryname || 'Category';
  const items = Array.isArray(data?.subcategory)    ? data.subcategory
              : Array.isArray(data?.sub_categories) ? data.sub_categories
              : Array.isArray(data?.items)          ? data.items
              : [];

  // Propagate the favourite flag onto each generated sub-category link.
  function withFavourite(href) {
    if (favourite !== '1') return href;
    const sep = href.includes('?') ? '&' : '?';
    return `${href}${sep}favourite=1`;
  }

  // Keep the Favourites sidebar item highlighted when we arrived via the
  // ?favourite=1 chain from the Favourites page.
  const sidebarActive = favourite === '1' ? 'favourites' : 'home';

  return (
    <Layout active={sidebarActive} title={title} back loading={!data && !error}>
      {!loading && !items.length ? (
        <NoRecords />
      ) : (
        <div className="tile-grid">
          {items.map((it) => {
            const subKey = it.categorykey || it.id;
            return (
              <CategoryTile
                key={it.categoryid || it.id || it.categorykey || it.title}
                title={it.categoryname || it.title}
                image={it.imageLink || it.image}
                to={withFavourite(subLink(cat, subKey))}
              />
            );
          })}
        </div>
      )}
    </Layout>
  );
}
