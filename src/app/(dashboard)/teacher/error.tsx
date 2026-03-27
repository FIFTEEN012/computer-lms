'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function TeacherError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#131313] border border-red-500/30 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <div className="font-mono text-[10px] text-red-400 uppercase tracking-widest mb-2">SYSTEM_ERROR</div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Something went wrong</h2>
          <p className="font-mono text-[10px] text-slate-500 mt-3 break-all">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> RETRY_OPERATION
        </button>
      </div>
    </div>
  )
}
