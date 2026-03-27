import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function StudentNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#131313] border border-slate-800 p-8 text-center space-y-6">
        <div className="font-mono text-6xl font-black text-slate-800">404</div>
        <div>
          <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-2">NODE_NOT_FOUND</div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Page Unavailable</h2>
          <p className="font-mono text-[10px] text-slate-500 mt-3">
            The requested resource does not exist or has been removed.
          </p>
        </div>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] uppercase tracking-widest hover:bg-cyan-500/20 transition-colors"
        >
          <Home className="w-3 h-3" /> RETURN_TO_BASE
        </Link>
      </div>
    </div>
  )
}
