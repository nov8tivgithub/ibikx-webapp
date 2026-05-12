export default function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 px-4 py-3 bg-white">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}
