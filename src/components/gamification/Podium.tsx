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
  const heights = ['h-32 md:h-44', 'h-48 md:h-64', 'h-24 md:h-36']
  const positions = ['2nd', '1st', '3rd']
  const medals = ['🥈', '🥇', '🥉']
  const borderColors = ['border-slate-400/30', 'border-yellow-500', 'border-amber-700/30']
  const glowColors = ['', 'shadow-glow-yellow scale-105 z-10', '']
  const bgColors = ['bg-slate-400/5', 'bg-yellow-500/10', 'bg-amber-700/5']
  const textColors = ['text-slate-400', 'text-yellow-500', 'text-amber-700']

  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 py-12 font-heading italic">
      {display.map((player, i) => {
        const level = getLevelInfo(player.xp)
        const colorClass = getLevelColor(level.level)
        const isFirst = i === 1

        return (
          <div key={positions[i]} className={`flex flex-col items-center w-32 md:w-44 transition-all duration-700 ${isFirst ? 'relative z-10' : 'opacity-80'}`}>
            {/* Avatar */}
            <div className="relative mb-6">
              {isFirst && (
                <Crown className="w-8 h-8 text-yellow-500 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce shadow-glow-yellow" />
              )}
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-none border-2 transition-transform duration-700 group-hover:scale-110 object-cover ${isFirst ? 'border-yellow-500 shadow-glow-yellow' : borderColors[i]} ${player.isCurrentUser ? 'ring-2 ring-primary animate-pulse' : ''}`}
                />
              ) : (
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-none border-2 transition-transform duration-700 group-hover:scale-110 bg-black/60 flex items-center justify-center ${isFirst ? 'border-yellow-500 shadow-glow-yellow' : borderColors[i]} ${player.isCurrentUser ? 'ring-2 ring-primary animate-pulse' : ''}`}>
                  <Terminal className="text-slate-600 w-8 h-8" />
                </div>
              )}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg transform hover:scale-150 transition-transform">{medals[i]}</div>
            </div>

            {/* Name */}
            <div className={`text-xs md:text-sm font-black uppercase tracking-[0.2em] text-center truncate w-full mt-2 mb-1 ${player.isCurrentUser ? 'text-primary shadow-glow-cyan' : 'text-white'}`}>
              {player.name}
            </div>
            <div className={`text-[9px] font-black ${colorClass} uppercase tracking-[0.3em] mb-4 flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              LV_0{level.level} {level.emoji}
            </div>

            {/* Podium Bar */}
            <div
              className={`w-full ${heights[i]} border-x border-t transition-all duration-1000 relative overflow-hidden flex flex-col items-center justify-center ${isFirst ? 'border-yellow-500 bg-yellow-500/10 shadow-glow-yellow' : borderColors[i] + ' ' + bgColors[i]}`}
            >
              <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>

              <div className={`text-3xl md:text-5xl font-black ${textColors[i]} relative z-10 italic tracking-tighter drop-shadow-lg`}>
                #0{i === 1 ? 1 : i === 0 ? 2 : 3}
              </div>
              <div className="flex items-center gap-2 mt-3 relative z-10 px-3 py-1 bg-black/40 border border-white/5 shadow-inner">
                <Zap className={`w-3.5 h-3.5 ${textColors[i]} shadow-glow-yellow animate-pulse`} />
                <span className={`text-[10px] md:text-xs font-black ${textColors[i]} tracking-widest`}>
                  {player.xp.toLocaleString()}_XP
                </span>
              </div>
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
