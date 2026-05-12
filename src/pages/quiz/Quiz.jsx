import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LeaderboardPodium from '../../components/quiz/LeaderboardPodium';
import LeaderboardRow from '../../components/quiz/LeaderboardRow';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getQuizService } from '../../services/quiz.service';
import { notify } from '../../utils/notify';

export default function Quiz() {
  const { data, loading, error } = useApiOnMount(getQuizService);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const banner    = data?.banner || {};
  const heading   = banner.heading   || 'Are You Ready?';
  const subheading = banner.subheading || 'Answer questions, track your score, and see how you rank.';
  const cta       = banner.cta       || 'Quiz will begin at 06:00 PM';
  const subCta    = banner.cta_sub   || 'Starting in 2h 28m 54s';
  const badges    = Array.isArray(data?.badges) ? data.badges : Array.from({ length: 7 });
  const winners   = data?.latest_winners || {};
  const winnerDate = winners.date || '06/05/2026';
  const winnerRows = Array.isArray(winners.rows) ? winners.rows : DEFAULT_WINNERS;
  const first  = winners.first  || { name: 'Sasidharan PV', role: 'Agent',     location: 'Irinjalakuda', initials: 'SP' };
  const second = winners.second || { name: 'Pandian P',     role: 'Director',  location: 'Namakkal',     initials: 'PP' };
  const third  = winners.third  || { name: 'M Muthuraman',  role: 'Agent',     location: 'Madurai',      initials: 'MM' };

  return (
    <Layout active="quiz" title="Quiz" loading={!data && !error}>
      <div className="space-y-6">
        <div
          className="rounded-2xl text-white p-5 lg:p-6 shadow-soft relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/img/quiz-banner-bg.png')" }}
        >
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight">{heading}</h2>
              <p className="mt-2 text-white/90 text-sm lg:text-base">{subheading}</p>
              <button className="mt-5 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm shadow-md">{cta}</button>
              <p className="text-xs text-white/85 mt-2 ml-2">{subCta}</p>
            </div>
            <img src="/assets/img/quiz-banner-icon.png" alt="" className="hidden sm:block w-24 lg:w-32 h-auto shrink-0 select-none pointer-events-none" />
          </div>
        </div>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg lg:text-xl font-bold text-slate-900">Badges</h3>
            <Link to="/quiz-history" className="text-sm font-semibold text-brand-blue hover:underline">View History</Link>
          </div>
          <p className="text-sm text-slate-500 mb-3">You have collected {data?.badges_earned ?? 0} badges this week.</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {badges.map((b, i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${b?.earned ? 'bg-amber-300 text-amber-900' : 'bg-slate-100 text-slate-300'}`}
              >★</div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg lg:text-xl font-bold text-slate-900">Latest Winners</h3>
            <Link to="/leaderboard" className="text-sm font-semibold text-brand-blue hover:underline">Leaderboard</Link>
          </div>
          <p className="text-xs text-slate-400 mb-2">{winnerDate}</p>
          <LeaderboardPodium first={first} second={second} third={third} />
          <div className="rounded-2xl border border-slate-100 mt-4 bg-white overflow-hidden">
            {winnerRows.map((r) => <LeaderboardRow key={r.rank} {...r} />)}
          </div>
        </section>
      </div>
    </Layout>
  );
}

const DEFAULT_WINNERS = [
  { rank: 4,  initials: 'MM', name: 'M Muthuraman',          role: 'Agent',           location: 'Madurai',    points: 70 },
  { rank: 5,  initials: 'CM', name: 'chinniah M',            role: 'Agent',           location: 'THANJAVUR',  points: 60 },
  { rank: 6,  initials: 'VP', name: 'Vasudevan unni Palappilly', role: 'Agent',       location: 'Thrissur',   points: 50 },
  { rank: 7,  initials: 'DS', name: 'Devarajan. S',          role: 'Agent',           location: 'Chennai',    points: 40 },
  { rank: 8,  initials: 'SP', name: 'SREEJITH. P, CIP',      role: 'Agent',           location: 'Vadakara',   points: 30 },
  { rank: 9,  initials: 'NK', name: 'Narayanan k',           role: 'CLIA',            location: 'Kannur',     points: 20 },
  { rank: 10, initials: 'ML', name: 'M L Thomas MDRT',       role: 'Agent',           location: 'Ernakulam',  points: 10 },
];
