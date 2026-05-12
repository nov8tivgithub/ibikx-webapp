import Layout from '../../components/layout/Layout';

const RECOMMENDED = [
  { label: 'Popular Plan', price: '₹899', validity: '6 Months', limit: 'Unlimited', save: 'Save ₹901' },
  { label: 'More Days',    price: '₹499', validity: '3 Months', limit: '10',        save: 'Save ₹401' },
];
const OTHERS = [
  { price: '₹129',  validity: '15 Days', limit: '10',        save: 'Save ₹21' },
  { price: '₹199',  validity: '1 Months', limit: '10',       save: 'Save ₹101' },
  { price: '₹1599', validity: '1 Years',  limit: 'Unlimited', save: 'Save ₹2051' },
  { price: '₹65',   validity: '7 Days',   limit: '10',        save: 'Save ₹5' },
];

function Row({ price, validity, limit }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-end">
      <p className="text-2xl font-extrabold text-slate-900">{price}<span className="text-red-500 align-top text-base">*</span></p>
      <div className="text-sm"><p className="text-slate-500">Validity</p><p className="font-semibold">{validity}</p></div>
      <div className="text-sm text-right"><p className="text-slate-500">Sharable cards/day</p><p className="font-semibold">{limit}</p></div>
    </div>
  );
}

export default function CardSubscriptionsExplore() {
  return (
    <Layout active="profile" title="Card Subscription Plans" back>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6 bg-brand-gradient-r text-white px-4 lg:px-8 py-8 lg:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <h2 className="relative text-2xl lg:text-3xl font-bold">Subscription Plans</h2>
        <article className="relative mt-5 rounded-2xl bg-white p-5 shadow-soft text-slate-900">
          <span className="inline-block px-3 py-1 rounded-md bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider mb-3">Last Plan</span>
          <Row price="₹10" validity="1 Days" limit="10" />
        </article>
      </div>

      <div className="max-w-3xl">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Recommended Plans</h3>
        <div className="space-y-3 mb-8">
          {RECOMMENDED.map((p) => (
            <article key={p.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft relative">
              <div className="flex items-start justify-between">
                <span className="inline-block px-3 py-1 rounded-md bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider mb-3">{p.label}</span>
                <span className="text-red-500 text-sm font-bold">{p.save}</span>
              </div>
              <Row price={p.price} validity={p.validity} limit={p.limit} />
            </article>
          ))}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Other Plans</h3>
        <div className="space-y-3">
          {OTHERS.map((p, i) => (
            <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-end mb-2"><span className="text-red-500 text-sm font-bold">{p.save}</span></div>
              <Row price={p.price} validity={p.validity} limit={p.limit} />
            </article>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-6">
          <span className="text-red-500 font-bold">*</span>{' '}
          <strong className="text-slate-700">Note:</strong> Subscription plan prices are calculated per language. Selecting multiple languages will increase the total cost accordingly.
        </p>
      </div>
    </Layout>
  );
}
