export default function LeaderboardRow({ rank, initials, name, role, location, points }) {
  return (
    <div className="flex items-center gap-4 lg:gap-6 px-4 lg:px-6 py-4 border-b border-slate-100 last:border-0">
      <span className="text-sm font-semibold text-slate-500 w-10 shrink-0">#{rank}</span>
      <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-slate-200 ring-2 ring-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0 overflow-hidden">{initials}</div>
      <p className="flex-1 min-w-0 text-sm lg:text-base font-medium text-slate-900 truncate">{name}</p>
      <p className="hidden md:block text-xs lg:text-sm text-slate-500 uppercase tracking-wider w-28 lg:w-32 shrink-0">{role}</p>
      <p className="hidden md:block text-xs lg:text-sm text-slate-700 w-28 lg:w-32 shrink-0 truncate">{location}</p>
      <p className="text-xs lg:text-sm font-semibold text-slate-900 w-16 text-right shrink-0">{points} pts</p>
    </div>
  );
}
