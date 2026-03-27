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
      <div className="flex items-center gap-2">
        <span className="text-lg">{info.emoji}</span>
        <div className="flex-1">
          <div className="h-1.5 w-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${barColors[info.level] || barColors[1]} transition-all duration-1000 ease-out ${glowColors[info.level] || ''}`}
              style={{ width: `${info.progress}%` }}
            />
          </div>
        </div>
        <span className={`font-mono text-[9px] ${colorClass} font-bold`}>LV{info.level}</span>
      </div>
    )
  }

  return (
    <div className="bg-[#131313] border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{info.emoji}</span>
          <div>
            {showLabel && (
              <div className={`font-mono text-[9px] uppercase tracking-widest ${colorClass}`}>
                LEVEL_{info.level}
              </div>
            )}
            <div className="font-sans font-black text-white text-sm uppercase tracking-tight">
              {info.name}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono text-lg font-black ${colorClass}`}>{xp.toLocaleString()}</div>
          <div className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">TOTAL_XP</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2 w-full bg-slate-800 relative overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${barColors[info.level] || barColors[1]} transition-all duration-1000 ease-out ${glowColors[info.level] || ''}`}
            style={{ width: `${info.progress}%` }}
          />
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none" />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-slate-600 uppercase tracking-widest">
          <span>{info.progress}%</span>
          {info.xpToNext > 0 ? (
            <span>{info.xpToNext} XP TO LEVEL_{info.level + 1}</span>
          ) : (
            <span>MAX_LEVEL_REACHED</span>
          )}
        </div>
      </div>
    </div>
  )
}
