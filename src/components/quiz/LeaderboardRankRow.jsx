export default function LeaderboardRankRow({ rank, initials, name, role, location, points, gradientClass }) {
  return (
    <div className={`flex items-center gap-3 px-4 lg:px-5 py-3 lg:py-4 rounded-2xl text-white shadow-md mb-3 ${gradientClass}`}>
      <span className="text-lg lg:text-xl font-extrabold w-10 shrink-0">#{rank}</span>
      <div className="w-11 h-11 rounded-full bg-white/30 ring-2 ring-white/50 flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm lg:text-base font-bold truncate">{name}</p>
        <p className="text-[11px] uppercase opacity-90 tracking-wider">{role}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm lg:text-base font-bold whitespace-nowrap">{points} pts</p>
        <p className="text-[11px] inline-flex items-center gap-1 opacity-95 whitespace-nowrap">● {location}</p>
      </div>
    </div>
  );
}
