export default function TeacherLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-64 bg-slate-800 rounded-sm" />
      <div className="h-4 w-96 bg-slate-800/50 rounded-sm" />

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#131313] border border-slate-800 p-5 space-y-3">
            <div className="h-3 w-20 bg-slate-800 rounded-sm" />
            <div className="h-8 w-16 bg-slate-800 rounded-sm" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-[#131313] border border-slate-800 mt-6">
        <div className="p-4 border-b border-slate-800">
          <div className="h-4 w-32 bg-slate-800 rounded-sm" />
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-800/50">
            <div className="w-8 h-8 bg-slate-800 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-slate-800 rounded-sm" />
              <div className="h-3 w-32 bg-slate-800/50 rounded-sm" />
            </div>
            <div className="h-6 w-20 bg-slate-800 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  )
}
