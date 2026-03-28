'use client'

import { getLevelInfo, getLevelColor, getLevelBorderColor } from '@/lib/xp'
import { Zap, Terminal } from 'lucide-react'

interface LeaderboardRowProps {
  rank: number
  name: string
  avatarUrl?: string | null
  xp: number
  badgeCount: number
  isCurrentUser: boolean
  studentId?: string
}

export default function LeaderboardRow({
  rank, name, avatarUrl, xp, badgeCount, isCurrentUser, studentId
}: LeaderboardRowProps) {
  const level = getLevelInfo(xp)
  const colorClass = getLevelColor(level.level)
  const borderColor = getLevelBorderColor(level.level)

  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-amber-600',
  }

  return (
    <div
      className={`flex items-center gap-6 p-5 border transition-all duration-500 relative overflow-hidden group italic font-heading ${
        isCurrentUser
          ? 'bg-primary/10 border-primary shadow-glow-cyan scale-[1.02] z-10'
          : 'bg-black/40 border-white/5 hover:border-white/20'
      }`}
    >
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Current user indicator */}
      {isCurrentUser && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary shadow-glow-cyan animate-pulse" />
      )}

      {/* Rank */}
      <div className={`w-14 text-center font-black text-3xl italic tracking-tighter ${rankColors[rank] || 'text-slate-800'} ${rank <= 3 ? 'drop-shadow-glow-cyan' : ''}`}>
        #{rank > 9 ? rank : '0' + rank}
      </div>

      {/* Avatar */}
      <div className="relative z-10">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className={`w-14 h-14 rounded-none border-2 object-cover transition-transform duration-700 group-hover:scale-110 ${isCurrentUser ? 'border-primary shadow-glow-cyan' : borderColor}`}
          />
        ) : (
          <div className={`w-14 h-14 rounded-none border-2 bg-black/60 flex items-center justify-center transition-transform duration-700 group-hover:scale-110 ${isCurrentUser ? 'border-primary shadow-glow-cyan' : borderColor}`}>
            <Terminal className="text-slate-600 w-6 h-6" />
          </div>
        )}
        {/* Level emoji badge */}
        <div className="absolute -bottom-2 -right-2 text-base bg-black border border-white/10 w-8 h-8 flex items-center justify-center shadow-lg transform rotate-12">
          {level.emoji}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className={`text-base md:text-xl font-black uppercase tracking-widest flex items-center gap-3 truncate ${isCurrentUser ? 'text-primary text-shadow-neon-cyan' : 'text-white'}`}>
          {name}
          {isCurrentUser && (
            <span className="text-[9px] bg-primary text-black px-3 py-0.5 font-black shrink-0 shadow-glow-cyan -rotate-3">YOU_OWNER</span>
          )}
        </div>
        <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] flex items-center gap-3 mt-1 not-italic">
          <span className={`${colorClass} flex items-center gap-1.5`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            LV_0{level.level} {level.name}
          </span>
          {badgeCount > 0 && (
            <span className="text-yellow-500/80 flex items-center gap-1.5 border-l border-white/10 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-glow-yellow" />
              BADGES_{badgeCount}
            </span>
          )}
        </div>
      </div>

      {/* XP */}
      <div className="text-right shrink-0 relative z-10">
        <div className="flex items-center gap-2 justify-end">
          <Zap className="w-5 h-5 text-yellow-500 shadow-glow-yellow animate-bounce" />
          <span className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none text-shadow-neon-cyan italic">
            {xp.toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-slate-800 font-black uppercase tracking-[0.3em] mt-1">XP_FLOW</div>
      </div>
    </div>
  )
}
