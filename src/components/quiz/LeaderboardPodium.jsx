export default function LeaderboardPodium({ first, second, third }) {
  return (
    <div className="flex items-end justify-center gap-6 lg:gap-12 py-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-slate-200 mx-auto ring-4 ring-slate-300 flex items-center justify-center text-slate-500 font-bold">{second.initials}</div>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border-2 border-slate-300 text-slate-500 text-xs font-bold -mt-3 relative">2</span>
        <p className="text-sm font-semibold text-slate-900 mt-2">{second.name}</p>
        <p className="text-[11px] text-slate-500 uppercase">{second.role}</p>
        {second.points != null && <p className="text-sm font-bold text-slate-900 mt-1">{second.points} pts</p>}
        <p className="text-[11px] text-brand-blue mt-0.5">● {second.location}</p>
      </div>
      <div className="text-center">
        <div className="text-2xl mb-1">👑</div>
        <div className="w-20 h-20 rounded-full bg-amber-200 mx-auto ring-4 ring-amber-400 flex items-center justify-center text-amber-800 font-bold text-lg">{first.initials}</div>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-bold -mt-3 relative">1</span>
        <p className="text-sm font-bold text-slate-900 mt-2">{first.name}</p>
        <p className="text-[11px] text-slate-500 uppercase">{first.role}</p>
        {first.points != null && <p className="text-base font-extrabold text-slate-900 mt-1">{first.points} pts</p>}
        <p className="text-[11px] text-brand-blue mt-0.5">● {first.location}</p>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 mx-auto ring-4 ring-orange-300 flex items-center justify-center text-orange-700 font-bold">{third.initials}</div>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-400 text-white text-xs font-bold -mt-3 relative">3</span>
        <p className="text-sm font-semibold text-slate-900 mt-2">{third.name}</p>
        <p className="text-[11px] text-slate-500 uppercase">{third.role}</p>
        {third.points != null && <p className="text-sm font-bold text-slate-900 mt-1">{third.points} pts</p>}
        <p className="text-[11px] text-brand-blue mt-0.5">● {third.location}</p>
      </div>
    </div>
  );
}
