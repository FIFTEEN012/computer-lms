'use client'

import { Lock } from 'lucide-react'

interface BadgeCardProps {
  name: string
  description: string | null
  icon_url: string | null   // emoji stored in icon_url
  earned: boolean
  earned_at?: string | null
  compact?: boolean
}

export default function BadgeCard({ name, description, icon_url, earned, earned_at, compact }: BadgeCardProps) {
  if (compact) {
    return (
      <div
        className={`relative flex items-center justify-center w-10 h-10 border text-lg transition-all ${
          earned
            ? 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_8px_rgba(234,179,8,0.2)]'
            : 'border-slate-800 bg-[#0a0a0a] opacity-40 grayscale'
        }`}
        title={`${name}${earned ? ' ✓' : ' (Locked)'}`}
      >
        {icon_url || '🏅'}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="w-3 h-3 text-slate-600" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative border p-4 transition-all group overflow-hidden ${
        earned
          ? 'border-yellow-500/30 bg-[#131313] hover:border-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.1)]'
          : 'border-slate-800 bg-[#0a0a0a] opacity-50'
      }`}
    >
      {/* Glow effect for earned */}
      {earned && (
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
      )}

      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 flex items-center justify-center text-2xl border ${
            earned
              ? 'border-yellow-500/40 bg-yellow-500/10'
              : 'border-slate-800 bg-[#0e0e0e] grayscale'
          }`}
        >
          {earned ? (icon_url || '🏅') : <Lock className="w-5 h-5 text-slate-700" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-sans font-bold text-sm uppercase tracking-tight ${earned ? 'text-white' : 'text-slate-600'}`}>
            {name}
          </div>
          <div className={`font-mono text-[9px] uppercase tracking-widest mt-1 leading-relaxed ${earned ? 'text-slate-400' : 'text-slate-700'}`}>
            {description || 'CLASSIFIED_OBJECTIVE'}
          </div>
          {earned && earned_at && (
            <div className="font-mono text-[8px] text-yellow-500/60 uppercase tracking-widest mt-2">
              UNLOCKED: {new Date(earned_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-mono text-[8px] text-slate-700 uppercase tracking-widest bg-black/60 px-3 py-1">
            LOCKED
          </div>
        </div>
      )}
    </div>
  )
}
