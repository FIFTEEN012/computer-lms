'use client'

import { getLevelInfo, getLevelColor } from '@/lib/xp'
import { Crown, Zap, Terminal } from 'lucide-react'

interface PodiumPlayer {
  name: string
  avatarUrl?: string | null
  xp: number
  badgeCount: number
  isCurrentUser: boolean
}

export default function Podium({ players }: { players: PodiumPlayer[] }) {
  if (players.length < 3) return null

  // Reorder for display: [2nd, 1st, 3rd]
  const display = [players[1], players[0], players[2]]
  const heights = ['h-28 md:h-36', 'h-40 md:h-48', 'h-20 md:h-28']
  const positions = ['2nd', '1st', '3rd']
  const medals = ['🥈', '🥇', '🥉']
  const borderColors = ['border-slate-300/40', 'border-yellow-500/60', 'border-amber-600/40']
  const glowColors = ['', 'shadow-[0_0_30px_rgba(234,179,8,0.2)]', '']
  const bgColors = ['bg-slate-300/5', 'bg-yellow-500/5', 'bg-amber-600/5']
  const textColors = ['text-slate-300', 'text-yellow-400', 'text-amber-600']

  return (
    <div className="flex items-end justify-center gap-2 md:gap-4 py-6">
      {display.map((player, i) => {
        const level = getLevelInfo(player.xp)
        const colorClass = getLevelColor(level.level)
        const isFirst = i === 1

        return (
          <div key={positions[i]} className="flex flex-col items-center w-28 md:w-36">
            {/* Avatar */}
            <div className="relative mb-3">
              {isFirst && (
                <Crown className="w-6 h-6 text-yellow-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
              )}
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${borderColors[i]} object-cover ${player.isCurrentUser ? 'ring-2 ring-blue-400' : ''}`}
                />
              ) : (
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${borderColors[i]} bg-slate-900 flex items-center justify-center ${player.isCurrentUser ? 'ring-2 ring-blue-400' : ''}`}>
                  <Terminal className="text-slate-600 w-6 h-6" />
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xl">{medals[i]}</div>
            </div>

            {/* Name */}
            <div className={`font-sans font-bold text-[10px] md:text-xs uppercase tracking-tight text-center truncate w-full mt-1 ${player.isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
              {player.name}
            </div>
            <div className={`font-mono text-[8px] ${colorClass} uppercase tracking-widest`}>
              {level.emoji} LV{level.level}
            </div>

            {/* Podium Bar */}
            <div
              className={`w-full ${heights[i]} mt-2 border ${borderColors[i]} ${bgColors[i]} ${glowColors[i]} flex flex-col items-center justify-center transition-all relative overflow-hidden`}
            >
              {/* Scanline */}
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_2px,rgba(255,255,255,0.02)_4px)] pointer-events-none" />

              <div className={`text-2xl md:text-3xl font-black ${textColors[i]} relative z-10`}>
                #{i === 1 ? 1 : i === 0 ? 2 : 3}
              </div>
              <div className="flex items-center gap-1 mt-1 relative z-10">
                <Zap className={`w-3 h-3 ${textColors[i]}`} />
                <span className={`font-mono text-[10px] md:text-xs font-bold ${textColors[i]}`}>
                  {player.xp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
