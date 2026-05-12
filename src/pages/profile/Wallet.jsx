import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { useApi } from '../../hooks/useApi';
import { getWalletService, getPointsCollectedService } from '../../services/wallet.service';
import { notify } from '../../utils/notify';

export default function Wallet() {
  const [tab, setTab] = useState('referral');
  const { data, loading, error } = useApiOnMount(getWalletService, [1]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const totalEarned = data?.total_earned ?? data?.summary?.total ?? '0 pts';
  const balance     = data?.balance       ?? data?.summary?.balance ?? '0 pts';
  const referralRows = Array.isArray(data?.referral) ? data.referral
                     : Array.isArray(data?.referral_history) ? data.referral_history
                     : [];
  const redeemRows   = Array.isArray(data?.redeem) ? data.redeem
                     : Array.isArray(data?.redeem_history) ? data.redeem_history
                     : [];

  // Optional secondary call when the user clicks "Points Collected".
  const pointsCollected = useApi(getPointsCollectedService);

  return (
    <Layout active="profile" title="Wallet" back loading={!data && !error}>
      <div className="max-w-3xl">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #dbeafe 0%, #bae6fd 100%)' }}>
          <div className="px-4 py-10 text-center">
            <div className="text-7xl select-none mb-2">💼</div>
            <p className="text-sm text-slate-600">Earn points by referring friends and redeem them inside the app.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4 -mt-4 relative">
            <div className="rounded-xl bg-white shadow-soft px-4 py-3 text-center">
              <p className="text-sm font-medium text-slate-600">Total Points Earned</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalEarned}</p>
            </div>
            <div className="rounded-xl bg-white shadow-soft px-4 py-3 text-center">
              <p className="text-sm font-medium text-slate-600">Balance Wallet Points</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{balance}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-6">
          <div className="segmented inline-flex bg-slate-100 rounded-full p-1 max-w-sm flex-1">
            <button
              type="button"
              onClick={() => setTab('referral')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold text-slate-600${tab === 'referral' ? ' is-active' : ''}`}
              data-tab="referral"
            >Referral History</button>
            <button
              type="button"
              onClick={() => setTab('redeem')}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold text-slate-600${tab === 'redeem' ? ' is-active' : ''}`}
              data-tab="redeem"
            >Redeem History</button>
          </div>
          <button
            type="button"
            onClick={() => pointsCollected.run(1)}
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            {pointsCollected.loading ? 'Loading…' : 'Points Collected »'}
          </button>
        </div>

        <section className="mt-8">
          {(tab === 'referral' ? referralRows : redeemRows).length === 0 ? (
            <p className="text-2xl text-slate-400 font-semibold text-center">No Records Found.</p>
          ) : (
            <ul className="space-y-2">
              {(tab === 'referral' ? referralRows : redeemRows).map((row, i) => (
                <li key={row.id || i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{row.title || row.name || `Entry ${i + 1}`}</p>
                    {row.date ? <p className="text-xs text-slate-500">{row.date}</p> : null}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{row.points ?? row.amount ?? ''}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {pointsCollected.data?.items?.length ? (
          <section className="mt-8 rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Points Collected</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {pointsCollected.data.items.map((p, i) => (
                <li key={p.id || i} className="flex justify-between">
                  <span>{p.label || p.title}</span>
                  <span className="font-semibold">{p.points}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Layout>
  );
}
