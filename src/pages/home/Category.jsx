import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import CategoryTile from '../../components/catalog/CategoryTile';
import { useApi } from '../../hooks/useApi';
import { getCategoryDetailsService } from '../../services/catalog.service';
import { notify } from '../../utils/notify';

export default function Category() {
  const [params]            = useSearchParams();
  const cat                 = params.get('cat') || '';
  const nameFallback        = params.get('name') || 'Category';
  const { data, loading, error, run } = useApi(getCategoryDetailsService);

  useEffect(() => { if (cat) run({ categorykey: cat, favourite: '0' }); }, [cat, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const title = data?.categoryname || nameFallback;
  const items = Array.isArray(data?.sub_categories) ? data.sub_categories
              : Array.isArray(data?.items)         ? data.items
              : [];

  return (
    <Layout active="home" title={title} back loading={!data && !error}>
      <div className="tile-grid">
        {items.map((it) => (
          <CategoryTile
            key={it.categoryid || it.id || it.categorykey || it.title}
            title={it.categoryname || it.title}
            image={it.imageLink || it.image}
            to={`/subcategory?cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(it.categorykey || it.id)}&name=${encodeURIComponent(it.categoryname || it.title || '')}`}
          />
        ))}
      </div>
    </Layout>
  );
}
