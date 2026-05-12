import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useApi } from '../../hooks/useApi';
import { getQuizAnswerDistributionService } from '../../services/quiz.service';
import { notify } from '../../utils/notify';

const FALLBACK = [
  { letter: 'A', text: 'Section 10', pct: 6.1,  correct: false },
  { letter: 'B', text: 'Section 38', pct: 24.2, correct: false },
  { letter: 'C', text: 'Section 39', pct: 57.6, correct: true  },
  { letter: 'D', text: 'Section 45', pct: 12.1, correct: false },
];

export default function QuizAnswerDistribution() {
  const [params]                       = useSearchParams();
  const quizId                         = params.get('id') || '';
  const { data, loading, error, run }  = useApi(getQuizAnswerDistributionService);

  useEffect(() => { if (quizId) run(quizId); }, [quizId, run]);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const question = data?.question
    || 'For an insurance policy nomination is allowed under __________ of the Insurance Act, 1938.';
  const options = Array.isArray(data?.options) && data.options.length ? data.options : FALLBACK;

  return (
    <Layout active="quiz" title="Answer Distribution" back loading={!data && !error}>
      <div className="space-y-6 max-w-3xl">
        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 leading-snug">{question}</h2>
        <ul className="space-y-5">
          {options.map((o) => (
            <li key={o.letter}>
              <p className="text-sm font-bold text-slate-400">
                {o.letter} <span className="text-slate-900 ml-1">{o.text}</span>
              </p>
              <div className="relative bg-slate-100 rounded-2xl h-12 mt-2 overflow-hidden flex items-center">
                <div
                  className={`absolute inset-y-0 left-0 rounded-2xl${o.correct ? ' bg-emerald-500' : ''}`}
                  style={o.correct ? { width: `${o.pct}%` } : { backgroundColor: '#1e9bff', width: `${o.pct}%` }}
                />
                <span className="ml-auto pr-4 relative text-sm font-bold text-slate-900">{o.pct}%</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
