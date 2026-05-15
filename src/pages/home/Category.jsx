import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CategoryTile from '../../components/catalog/CategoryTile';
import { useApi } from '../../hooks/useApi';
import { getCategoryDetailsService } from '../../services/catalog.service';
import { subLink } from '../../data/categories';
import { notify } from '../../utils/notify';

export default function Category() {
  const { catKey: rawKey } = useParams();
  const cat                 = decodeURIComponent(rawKey || '');
  const { data, loading, error, run } = useApi(getCategoryDetailsService);

  useEffect(() => { if (cat) run({ categorykey: cat, favourite: '0' }); }, [cat, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  // API shape: { category: "Plan based", subcategory: [ ... ] }
  // Older keys (categoryname / sub_categories / items) kept as fallbacks.
  const title = data?.category || data?.categoryname || 'Category';
  const items = Array.isArray(data?.subcategory)    ? data.subcategory
              : Array.isArray(data?.sub_categories) ? data.sub_categories
              : Array.isArray(data?.items)          ? data.items
              : [];

  return (
    <Layout active="home" title={title} back loading={!data && !error}>
      <div className="tile-grid">
        {items.map((it) => {
          const subKey = it.categorykey || it.id;
          return (
            <CategoryTile
              key={it.categoryid || it.id || it.categorykey || it.title}
              title={it.categoryname || it.title}
              image={it.imageLink || it.image}
              to={subLink(cat, subKey)}
            />
          );
        })}
      </div>
    </Layout>
  );
}
