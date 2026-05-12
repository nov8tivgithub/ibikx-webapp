import { Link } from 'react-router-dom';

export default function QuizHistoryItem({ question, date, status, statusClass, quizId }) {
  const to = quizId
    ? `/quiz-history-detail?id=${encodeURIComponent(quizId)}`
    : '/quiz-history-detail';
  return (
    <Link
      to={to}
      className="block rounded-2xl bg-white border border-slate-100 shadow-md hover:shadow-lg transition-shadow px-5 py-4 lg:px-6 lg:py-5"
    >
      <p className="text-base lg:text-lg font-semibold text-slate-900 leading-snug">{question}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-slate-500">{date}</span>
        <span className={`text-sm font-bold ${statusClass}`}>{status}</span>
      </div>
    </Link>
  );
}
