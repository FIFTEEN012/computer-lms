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
      className={`flex items-center gap-4 p-4 border transition-all relative overflow-hidden group ${
        isCurrentUser
          ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
          : 'bg-[#0e0e0e] border-slate-800 hover:border-slate-600'
      }`}
    >
      {/* Current user indicator */}
      {isCurrentUser && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
      )}

      {/* Rank */}
      <div className={`w-12 text-center font-mono font-black text-2xl italic tracking-tighter ${rankColors[rank] || 'text-slate-700'}`}>
        #{rank}
      </div>

      {/* Avatar */}
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className={`w-12 h-12 rounded-full border-2 object-cover ${isCurrentUser ? 'border-blue-400' : borderColor}`}
          />
        ) : (
          <div className={`w-12 h-12 rounded-full border-2 bg-slate-900 flex items-center justify-center ${isCurrentUser ? 'border-blue-400' : borderColor}`}>
            <Terminal className="text-slate-600 w-5 h-5" />
          </div>
        )}
        {/* Level emoji badge */}
        <div className="absolute -bottom-1 -right-1 text-sm bg-[#0e0e0e] border border-slate-800 w-6 h-6 flex items-center justify-center text-[10px]">
          {level.emoji}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`font-sans font-bold text-sm md:text-base uppercase tracking-tight flex items-center gap-2 truncate ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
          {name}
          {isCurrentUser && (
            <span className="font-mono text-[8px] bg-blue-500/20 px-2 py-0.5 border border-blue-500/30 shrink-0">YOU</span>
          )}
        </div>
        <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className={colorClass}>LV{level.level} {level.name}</span>
          {badgeCount > 0 && (
            <span className="text-yellow-500/60">🏅 ×{badgeCount}</span>
          )}
        </div>
      </div>

      {/* XP */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1.5 justify-end">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="font-sans font-black text-xl md:text-2xl text-white tracking-widest leading-none">
            {xp.toLocaleString()}
          </span>
        </div>
        <div className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">XP</div>
      </div>
    </div>
  )
}
