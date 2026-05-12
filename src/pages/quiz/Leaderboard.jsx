import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import LeaderboardPodium from '../../components/quiz/LeaderboardPodium';
import LeaderboardRow from '../../components/quiz/LeaderboardRow';
import LeaderboardRankRow from '../../components/quiz/LeaderboardRankRow';
import { useApi } from '../../hooks/useApi';
import { getWinnersService } from '../../services/certificate.service';
import { notify } from '../../utils/notify';

const TABS = [
  { key: 'latest', label: 'Latest' },
  { key: 'month',  label: 'This Month' },
  { key: 'year',   label: 'This Year' },
];

export default function Leaderboard() {
  const [tab, setTab]                  = useState('latest');
  const { data, loading, error, run }  = useApi(getWinnersService);

  // Refetch on tab change.
  useEffect(() => { run(tab); }, [tab, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const podium     = data?.podium || {};
  const first      = podium.first  || FALLBACK_PODIUM[tab].first;
  const second     = podium.second || FALLBACK_PODIUM[tab].second;
  const third      = podium.third  || FALLBACK_PODIUM[tab].third;
  const rows       = Array.isArray(data?.rows) ? data.rows : FALLBACK_ROWS[tab];
  const yearLabel  = data?.label || (tab === 'month' ? 'May 2026' : tab === 'year' ? 'FY 2026-27' : '');
  const me         = data?.me;

  return (
    <Layout active="quiz" title="Leaderboard" back loading={!data && !error}>
      <div className="space-y-6">
        <div className="segmented inline-flex bg-slate-100 rounded-full p-1 w-full max-w-md">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              disabled={loading && tab !== t.key}
              className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold text-slate-600${tab === t.key ? ' is-active' : ''}`}
              data-tab={t.key}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'latest' && (
          <section>
            <LeaderboardPodium first={first} second={second} third={third} />
            <div className="rounded-2xl border border-slate-100 bg-white mt-6 overflow-hidden">
              {rows.map((r) => <LeaderboardRow key={r.rank} {...r} />)}
            </div>
          </section>
        )}

        {tab === 'month' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">{yearLabel}</h2>
            </div>
            <LeaderboardRankRow rank={1} {...first}  gradientClass="rank-gold" />
            <LeaderboardRankRow rank={2} {...second} gradientClass="rank-silver" />
            <LeaderboardRankRow rank={3} {...third}  gradientClass="rank-bronze" />
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
              {rows.map((r) => <LeaderboardRow key={r.rank} {...r} />)}
            </div>
          </section>
        )}

        {tab === 'year' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">{yearLabel}</h2>
            </div>
            <LeaderboardRankRow rank={1} {...first}  gradientClass="rank-gold" />
            <LeaderboardRankRow rank={2} {...second} gradientClass="rank-silver" />
            <LeaderboardRankRow rank={3} {...third}  gradientClass="rank-bronze" />
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
              {rows.map((r) => <LeaderboardRow key={r.rank} {...r} />)}
            </div>
            {me ? (
              <a href="#" className="mt-4 flex items-center gap-3 px-4 py-4 rounded-2xl text-white shadow-md bg-brand-gradient-r">
                <span className="text-base font-extrabold w-12 shrink-0">#{me.rank}</span>
                <div className="w-11 h-11 rounded-full bg-white/30 ring-2 ring-white/50 flex items-center justify-center text-xs font-bold shrink-0">{me.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm lg:text-base font-bold truncate">{me.name}</p>
                  <p className="text-[11px] uppercase opacity-90 tracking-wider">{me.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm lg:text-base font-bold">{me.points} pts</p>
                  <p className="text-[11px] inline-flex items-center gap-1 opacity-95">● {me.location}</p>
                </div>
              </a>
            ) : null}
          </section>
        )}
      </div>
    </Layout>
  );
}

// Fallbacks used until the real backend response is hooked up.
const FALLBACK_PODIUM = {
  latest: {
    first:  { name: 'M L Thomas MDRT', role: 'Agent',           location: 'Ernakulam', initials: 'ML', points: 100 },
    second: { name: 'Pandian P',       role: 'DirectMarketing', location: 'NAMAKKAL',  initials: 'PP', points: 90 },
    third:  { name: 'Narayanan k',     role: 'CLIA',            location: 'Kannur',    initials: 'NK', points: 80 },
  },
  month: {
    first:  { name: 'Pandian P',          role: 'DirectMarketing', location: 'NAMAKKAL',  initials: 'PP', points: '545.5' },
    second: { name: 'Narayanan k',        role: 'CLIA',            location: 'Kannur',    initials: 'NK', points: '422.3' },
    third:  { name: 'M L Thomas MDRT',    role: 'Agent',           location: 'Ernakulam', initials: 'ML', points: '415.2' },
  },
  year: {
    first:  { name: 'M L Thomas MDRT',    role: 'Agent', location: 'Ernakulam', initials: 'ML', points: '2,380.3' },
    second: { name: 'T Prakashan MDRT Life', role: 'CLIA', location: 'KANNUR', initials: 'TP', points: '2,291.1' },
    third:  { name: 'SRIRAM J',           role: 'CLIA',  location: 'Chennai',   initials: 'SJ', points: '1,803.4' },
  },
};

const FALLBACK_ROWS = {
  latest: [
    { rank: 4,  initials: 'MM', name: 'M Muthuraman',          role: 'Agent',           location: 'Madurai',    points: 70 },
    { rank: 5,  initials: 'CM', name: 'chinniah M',            role: 'Agent',           location: 'THANJAVUR',  points: 60 },
    { rank: 6,  initials: 'VP', name: 'Vasudevan unni Palappilly', role: 'Agent',       location: 'Thrissur',   points: 50 },
    { rank: 7,  initials: 'DS', name: 'Devarajan. S',          role: 'Agent',           location: 'Chennai',    points: 40 },
    { rank: 8,  initials: 'SP', name: 'SREEJITH. P, CIP',      role: 'Agent',           location: 'Vadakara',   points: 30 },
    { rank: 9,  initials: 'SV', name: 'Selvaraj V',            role: 'Agent',           location: 'Pudukkottai', points: 20 },
    { rank: 10, initials: 'MP', name: 'Manikandan P P',        role: 'DirectMarketing', location: 'Ottapalam',  points: 10 },
  ],
  month: [
    { rank: 4,  initials: 'DS', name: 'Devarajan. S',           role: 'Agent', location: 'Chennai',     points: 328.2 },
    { rank: 5,  initials: 'MM', name: 'M Muthuraman',           role: 'Agent', location: 'Madurai',     points: 317.9 },
    { rank: 6,  initials: 'TP', name: 'T Prakashan MDRT Life',  role: 'CLIA',  location: 'KANNUR',      points: 315.7 },
    { rank: 7,  initials: 'VA', name: 'VALLINAYAGAM A',         role: 'Agent', location: 'Tirunelveli', points: 289.8 },
    { rank: 8,  initials: 'SP', name: 'Sasidharan PV',          role: 'Agent', location: 'Irinjalakuda', points: 270.5 },
    { rank: 9,  initials: 'SJ', name: 'SRIRAM J',               role: 'CLIA',  location: 'Chennai',     points: 263.4 },
    { rank: 10, initials: 'RA', name: 'Ramesh A.S',             role: 'Agent', location: 'Karaikal',    points: 130.3 },
  ],
  year: [
    { rank: 4,  initials: 'PP', name: 'Pandian P',              role: 'DirectMarketing', location: 'NAMAKKAL',   points: '1,735.5' },
    { rank: 5,  initials: 'DS', name: 'Devarajan. S',           role: 'Agent',           location: 'Chennai',     points: '1,706.8' },
    { rank: 6,  initials: 'NK', name: 'Narayanan k',            role: 'CLIA',            location: 'Kannur',      points: '1,287.5' },
    { rank: 7,  initials: 'VA', name: 'VALLINAYAGAM A',         role: 'Agent',           location: 'Tirunelveli', points: '1,250.8' },
    { rank: 8,  initials: 'MM', name: 'M Muthuraman',           role: 'Agent',           location: 'Madurai',     points: '1,234.7' },
    { rank: 9,  initials: 'SP', name: 'Sasidharan PV',          role: 'Agent',           location: 'Irinjalakuda', points: '1,137.8' },
    { rank: 10, initials: 'RA', name: 'Rajan AP',               role: 'Agent',           location: 'Thrissur',    points: '1,118.9' },
  ],
};
