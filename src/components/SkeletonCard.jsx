export function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 animate-pulse space-y-3">
      <div className="h-4 bg-slate-800 rounded w-1/3"></div>
      <div className="h-8 bg-slate-800 rounded w-1/2"></div>
      <div className="h-3 bg-slate-800 rounded w-1/4"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="h-6 bg-slate-800 rounded w-1/4 mb-6"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800/40">
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-slate-800 rounded"></div>
            <div className="h-3 bg-slate-800/60 rounded w-2/3"></div>
          </div>
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonCard;
