import { useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import QuizHistoryItem from '../../components/quiz/QuizHistoryItem';
import { useApiOnMount } from '../../hooks/useApiOnMount';
import { getQuizHistoryService } from '../../services/quiz.service';
import { notify } from '../../utils/notify';

export default function QuizHistory() {
  const { data, loading, error } = useApiOnMount(getQuizHistoryService);
  useEffect(() => { if (error) notify.error(error); }, [error]);

  const items = Array.isArray(data?.items) ? data.items
              : Array.isArray(data?.history) ? data.history
              : Array.isArray(data) ? data
              : [];

  return (
    <Layout active="quiz" title="Quiz History" back loading={!data && !error}>
      <div className="space-y-4">
        {items.map((it) => (
          <QuizHistoryItem
            key={it.id || it.quiz_id || it.date}
            quizId={it.quiz_id || it.id}
            question={it.question}
            date={it.date}
            status={it.status}
            statusClass={(it.attended || it.status === 'Attended') ? 'text-emerald-600' : 'text-red-500'}
          />
        ))}
      </div>
    </Layout>
  );
}
