export default function StudentLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-64 bg-slate-800 rounded-sm" />
      <div className="h-4 w-96 bg-slate-800/50 rounded-sm" />

      {/* Card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#131313] border border-slate-800 p-6 space-y-4">
            <div className="h-3 w-24 bg-slate-800 rounded-sm" />
            <div className="h-6 w-48 bg-slate-800 rounded-sm" />
            <div className="h-3 w-32 bg-slate-800/50 rounded-sm" />
            <div className="h-2 w-full bg-slate-800/30 rounded-sm mt-4" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-[#131313] border border-slate-800 mt-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-800/50">
            <div className="w-8 h-8 bg-slate-800 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-slate-800 rounded-sm" />
              <div className="h-3 w-24 bg-slate-800/50 rounded-sm" />
            </div>
            <div className="h-6 w-16 bg-slate-800 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
