import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';

const RECOMMENDED = [
  {
    label: 'Last Plan', price: '₹10', save: null,
    validity: '1 Days', limit: '10',
  },
  {
    label: 'Popular Plan', price: '₹899', save: 'Save ₹901',
    validity: '6 Months', limit: 'Unlimited',
  },
  {
    label: 'More Days', price: '₹499', save: 'Save ₹401',
    validity: '3 Months', limit: '10',
  },
];

export default function CardSubscriptions() {
  return (
    <Layout active="profile" title="Card Subscription Plans" back>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6 bg-brand-gradient-r text-white px-4 lg:px-8 py-8 lg:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <h2 className="relative text-2xl lg:text-3xl font-bold">Subscription Plans</h2>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-slate-900">Current Plan</h3>
          <span className="px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold">Expiring in 236 days</span>
        </div>
        <p className="text-2xl lg:text-3xl font-extrabold text-brand-blue mb-1">₹10.00</p>
        <hr className="my-4 border-slate-100" />

        <h3 className="text-xl font-bold text-slate-900 mb-4">Recommended Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {RECOMMENDED.map((p) => (
            <article key={p.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <span className="inline-block px-3 py-1 rounded-md bg-orange-500 text-white text-[11px] font-bold uppercase tracking-wider mb-3">{p.label}</span>
                {p.save && <span className="text-red-500 text-sm font-bold">{p.save}</span>}
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{p.price}<span className="text-red-500 align-top text-base">*</span></p>
              <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-slate-500">Validity</dt><dd className="text-right font-semibold text-slate-900">{p.validity}</dd>
                <dt className="text-slate-500">Sharable cards/day</dt><dd className="text-right font-semibold text-slate-900">{p.limit}</dd>
              </dl>
            </article>
          ))}
        </div>

        <Link to="/card-subscriptions-explore" className="block w-full text-center px-4 py-3 rounded-xl border-2 border-brand-blue text-brand-blue font-semibold text-sm hover:bg-brand-blue/5">Explore All plans</Link>

        <p className="text-xs text-slate-500 mt-6">
          <span className="text-red-500 font-bold">*</span>{' '}
          <strong className="text-slate-700">Note:</strong> Subscription plan prices are calculated per language. Selecting multiple languages will increase the total cost accordingly.
        </p>
      </div>
    </Layout>
  );
}
