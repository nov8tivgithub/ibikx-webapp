import Layout from '../../components/layout/Layout';

const PLANS = [
  { price: '₹99',  validity: 'Life Time', limit: '1' },
  { price: '₹198', validity: 'Life Time', limit: '3', extras: [['Buy 2 Get 1 Free', 'Save ₹99']] },
  { price: '₹1.00', validity: 'Life Time', limit: '1' },
];

export default function VideoSubscriptions() {
  return (
    <Layout active="profile" title="Video Subscription Plans" back>
      <div className="-mx-4 lg:-mx-8 -mt-6 mb-6 bg-brand-gradient-r text-white px-4 lg:px-8 py-8 lg:py-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <h2 className="relative text-2xl lg:text-3xl font-bold">Video Subscription Plans</h2>
      </div>

      <div className="max-w-3xl">
        <span className="inline-block px-4 py-1.5 rounded-full border border-slate-300 text-sm text-slate-700 mb-4">Remaining Credits: 9</span>

        <h3 className="text-xl font-bold text-slate-900 mb-4">Recommended Plans</h3>
        <div className="space-y-4">
          {PLANS.map((p, i) => (
            <article key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-2xl font-extrabold text-slate-900">{p.price}<span className="text-red-500 align-top text-base">*</span></p>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Validity</dt><dd className="font-semibold text-slate-900">{p.validity}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Video personalization limit</dt><dd className="font-semibold text-slate-900">{p.limit}</dd></div>
                {p.extras?.map(([k, v]) => (
                  <div key={k} className="flex justify-between"><dt className="text-slate-700 font-medium">{k}</dt><dd className="text-red-500 font-bold">{v}</dd></div>
                ))}
              </dl>
              <div className="flex justify-end mt-4">
                <button className="px-8 py-2.5 rounded-full bg-brand-gradient-r text-white text-sm font-semibold shadow-soft">Recharge</button>
              </div>
            </article>
          ))}
        </div>

        <p className="text-xs text-slate-500 mt-6">
          <span className="text-red-500 font-bold">*</span>{' '}
          <strong className="text-slate-700">Note:</strong> Each credit purchased allows you to personalize one video, in any one language.
        </p>
      </div>
    </Layout>
  );
}
