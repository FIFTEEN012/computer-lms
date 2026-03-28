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
        className={`relative flex items-center justify-center w-11 h-11 border text-xl transition-all duration-500 italic font-heading ${
          earned
            ? 'border-yellow-500/50 bg-yellow-500/10 shadow-glow-yellow scale-105'
            : 'border-white/5 bg-black grayscale opacity-30 shadow-none'
        }`}
        title={`${name}${earned ? ' ✓' : ' (Locked)'}`}
      >
        <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
        <span className="relative z-10">{icon_url || '🏅'}</span>
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
            <Lock className="w-3.5 h-3.5 text-slate-800" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative border p-6 transition-all duration-500 group overflow-hidden italic font-heading ${
        earned
          ? 'border-yellow-500/30 bg-black/60 hover:border-yellow-500 shadow-2xl backdrop-blur-3xl'
          : 'border-white/5 bg-black/20 opacity-40'
      }`}
    >
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
      
      {earned && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent shadow-glow-yellow animate-pulse" />
      )}

      <div className="flex items-start gap-5 relative z-10">
        <div
          className={`w-14 h-14 flex items-center justify-center text-3xl border transition-all duration-700 ${
            earned
              ? 'border-yellow-500/40 bg-yellow-500/10 shadow-glow-yellow group-hover:scale-110'
              : 'border-white/5 bg-black/40 grayscale'
          }`}
        >
          {earned ? (icon_url || '🏅') : <Lock className="w-6 h-6 text-slate-900" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm md:text-base font-black uppercase tracking-widest leading-tight ${earned ? 'text-white text-shadow-neon-cyan' : 'text-slate-700'}`}>
            {name}
          </div>
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 leading-relaxed not-italic ${earned ? 'text-slate-400' : 'text-slate-800'}`}>
            {description || 'CLASSIFIED_SYSTEM_INTEL'}
          </div>
          {earned && earned_at && (
            <div className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping"></span>
              DECODED: {new Date(earned_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {!earned && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-700">
          <div className="text-[10px] text-slate-800 font-black uppercase tracking-[0.4em] bg-black/60 px-4 py-1.5 border border-white/5">
            ENCRYPTED_LOCKED
          </div>
        </div>
      )}
      <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none text-white font-heading text-6xl font-black italic select-none">ACH_DATA</div>
    </div>
  )
}
