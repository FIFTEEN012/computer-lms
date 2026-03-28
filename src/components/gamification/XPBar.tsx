'use client'

import { getLevelInfo, getLevelColor } from '@/lib/xp'

export default function XPBar({ xp, showLabel = true, compact = false }: { xp: number; showLabel?: boolean; compact?: boolean }) {
  const info = getLevelInfo(xp)
  const colorClass = getLevelColor(info.level)

  const barColors: Record<number, string> = {
    1: 'from-emerald-500 to-emerald-400',
    2: 'from-cyan-500 to-cyan-400',
    3: 'from-yellow-500 to-yellow-400',
    4: 'from-orange-500 to-orange-400',
    5: 'from-fuchsia-500 to-fuchsia-400',
  }

  const glowColors: Record<number, string> = {
    1: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
    2: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    3: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]',
    4: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]',
    5: 'shadow-[0_0_12px_rgba(217,70,239,0.4)]',
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 font-heading italic">
        <span className="text-xl drop-shadow-glow-cyan">{info.emoji}</span>
        <div className="flex-1">
          <div className="h-2 w-full bg-white/5 border border-white/5 overflow-hidden relative">
            <div
              className={`h-full bg-gradient-to-r ${barColors[info.level] || barColors[1]} transition-all duration-1000 ease-out ${glowColors[info.level] || ''} relative z-10`}
              style={{ width: `${info.progress}%` }}
            />
            <div className="absolute inset-0 scanlines opacity-[0.1] pointer-events-none z-20"></div>
          </div>
        </div>
        <span className={`text-[10px] ${colorClass} font-black tracking-[0.2em]`}>LV_0{info.level}</span>
      </div>
    )
  }

  return (
    <div className="bg-black/60 border border-white/5 p-6 space-y-5 shadow-2xl backdrop-blur-2xl relative overflow-hidden group italic font-heading">
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <span className="text-4xl drop-shadow-glow-cyan transform group-hover:scale-110 transition-transform duration-700">{info.emoji}</span>
          <div>
            {showLabel && (
              <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${colorClass} mb-1 animate-pulse`}>
                INIT_PROTOCOL: SYNC_0{info.level}
              </div>
            )}
            <div className="text-xl md:text-2xl font-black text-white uppercase tracking-widest glitch-text">
              {info.name}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black ${colorClass} text-shadow-neon-cyan`}>{xp.toLocaleString()}</div>
          <div className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mt-1">TOTAL_XP_ACCUMULATED</div>
        </div>
      </div>

      <div className="space-y-4 relative z-10 px-1">
        <div className="h-3 w-full bg-white/5 border border-white/5 relative overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${barColors[info.level] || barColors[1]} transition-all duration-1000 ease-out ${glowColors[info.level] || ''} relative z-10 shadow-[0_0_20px_rgba(var(--primary),0.3)]`}
            style={{ width: `${info.progress}%` }}
          />
          <div className="absolute inset-0 scanlines opacity-[0.2] pointer-events-none z-20" />
        </div>
        <div className="flex justify-between text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] font-heading">
          <span className="text-white bg-white/5 px-3 py-1 border border-white/10 shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]">{info.progress}% SYNCED</span>
          {info.xpToNext > 0 ? (
            <span className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></span>
               {info.xpToNext} XP TO NEXT_EVOLUTION
            </span>
          ) : (
            <span className="text-emerald-500 shadow-glow-emerald px-3 py-1 bg-emerald-500/10 border border-emerald-500/20">PEAK_PERFORMANCE_REACHED</span>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none text-white font-heading text-6xl font-black italic select-none">XP_DATA</div>
    </div>
  )
}
