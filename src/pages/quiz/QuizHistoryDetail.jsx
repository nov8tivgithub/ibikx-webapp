import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import LeaderboardPodium from '../../components/quiz/LeaderboardPodium';
import LeaderboardRow from '../../components/quiz/LeaderboardRow';
import { useApi } from '../../hooks/useApi';
import { getQuizDetailsService } from '../../services/quiz.service';
import { notify } from '../../utils/notify';

export default function QuizHistoryDetail() {
  const [params]                       = useSearchParams();
  const quizId                         = params.get('id') || '';
  const { data, loading, error, run }  = useApi(getQuizDetailsService);

  useEffect(() => { if (quizId) run(quizId); }, [quizId, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const question     = data?.question || 'For an insurance policy nomination is allowed under __________ of the Insurance Act, 1938.';
  const status       = data?.status || 'Not Attended';
  const difficulty   = data?.difficulty_label || 'Moderate';
  const correctPct   = data?.correct_percent ?? 58;
  const needle       = -90 + (correctPct * 1.8);
  const options      = Array.isArray(data?.options) ? data.options : DEFAULT_OPTIONS;
  const winners      = data?.winners || {};
  const podiumFirst  = winners.first  || { name: 'Narayanan k',  role: 'CLIA',  location: 'Kannur',  initials: 'NK' };
  const podiumSecond = winners.second || { name: 'T Prakashan',  role: 'CLIA',  location: 'KANNUR',  initials: 'TP' };
  const podiumThird  = winners.third  || { name: 'Ganesan C',    role: 'Agent', location: 'Tirupur', initials: 'GC' };
  const winnerRows   = Array.isArray(winners.rows) ? winners.rows : DEFAULT_WINNERS;

  return (
    <Layout active="quiz" title="Quiz History" back loading={!data && !error}>
      <div className="space-y-6">
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <svg viewBox="0 0 200 120" className="w-44 lg:w-52 h-auto shrink-0">
            <path d="M 25 100 A 75 75 0 0 1 62 35" stroke="#f87171" strokeWidth="16" fill="none" strokeLinecap="round" />
            <path d="M 62 35 A 75 75 0 0 1 138 35" stroke="#facc15" strokeWidth="16" fill="none" />
            <path d="M 138 35 A 75 75 0 0 1 175 100" stroke="#4ade80" strokeWidth="16" fill="none" strokeLinecap="round" />
            <g fontSize="9" fill="#94a3b8" fontWeight="700">
              <text x="14" y="116" textAnchor="middle">0</text>
              <text x="38" y="60" textAnchor="middle">20</text>
              <text x="68" y="22" textAnchor="middle">40</text>
              <text x="100" y="14" textAnchor="middle">60</text>
              <text x="132" y="22" textAnchor="middle">80</text>
              <text x="186" y="116" textAnchor="middle">100</text>
            </g>
            <g transform={`rotate(${needle} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="35" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="100" cy="100" r="5" fill="#0f172a" />
          </svg>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Difficulty Level:</h2>
            <p className="text-2xl lg:text-3xl font-extrabold text-amber-500 mt-1">{difficulty}</p>
            <p className="text-sm text-slate-600 mt-2">{correctPct}% users answered correctly</p>
            <Link
              to={quizId ? `/quiz-answer-distribution?id=${encodeURIComponent(quizId)}` : '/quiz-answer-distribution'}
              className="inline-block mt-2 text-sm font-semibold text-brand-blue hover:underline"
            >Answer Distribution</Link>
          </div>
        </section>

        <section>
          <p className="text-sm font-medium text-slate-500 mb-2">{status}</p>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900 leading-snug">{question}</h3>
          <ul className="mt-5 space-y-3 max-w-2xl">
            {options.map((opt) => {
              const correct = !!opt.correct;
              return (
                <li
                  key={opt.letter}
                  className={
                    correct
                      ? 'flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50'
                      : 'flex items-center gap-3 px-4 py-3 lg:px-5 lg:py-4 rounded-2xl border border-slate-200 bg-white'
                  }
                >
                  <span className={correct ? 'text-xs font-bold uppercase text-emerald-600 w-5' : 'text-xs font-bold uppercase text-slate-400 w-5'}>{opt.letter}</span>
                  <span className={correct ? 'flex-1 text-base font-semibold text-emerald-900' : 'flex-1 text-base font-medium text-slate-800'}>{opt.text}</span>
                  {correct ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4">Winners</h3>
          <LeaderboardPodium first={podiumFirst} second={podiumSecond} third={podiumThird} />
          <div className="rounded-2xl border border-slate-100 bg-white mt-6 overflow-hidden">
            {winnerRows.map((r) => <LeaderboardRow key={r.rank} {...r} />)}
          </div>
        </section>
      </div>
    </Layout>
  );
}

const DEFAULT_OPTIONS = [
  { letter: 'A', text: 'Section 10', correct: false },
  { letter: 'B', text: 'Section 38', correct: false },
  { letter: 'C', text: 'Section 39', correct: true  },
  { letter: 'D', text: 'Section 45', correct: false },
];

const DEFAULT_WINNERS = [
  { rank: 4,  initials: 'MM', name: 'M Muthuraman',     role: 'Agent',           location: 'Madurai',     points: 70 },
  { rank: 5,  initials: 'PP', name: 'Pandian P',        role: 'DirectMarketing', location: 'NAMAKKAL',    points: 60 },
  { rank: 6,  initials: 'SJ', name: 'SRIRAM J',         role: 'CLIA',            location: 'Chennai',     points: 50 },
  { rank: 7,  initials: 'ML', name: 'M L Thomas MDRT',  role: 'Agent',           location: 'Ernakulam',   points: 40 },
  { rank: 8,  initials: 'DS', name: 'Devarajan. S',     role: 'Agent',           location: 'Chennai',     points: 30 },
  { rank: 9,  initials: 'VA', name: 'VALLINAYAGAM A',   role: 'Agent',           location: 'Tirunelveli', points: 20 },
  { rank: 10, initials: 'CM', name: 'chinniah M',       role: 'Agent',           location: 'THANJAVUR',   points: 10 },
];
