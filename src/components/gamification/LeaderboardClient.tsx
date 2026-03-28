'use client'

import { useState } from 'react'
import Podium from '@/components/gamification/Podium'
import LeaderboardRow from '@/components/gamification/LeaderboardRow'
import XPBar from '@/components/gamification/XPBar'
import BadgeCard from '@/components/gamification/BadgeCard'
import { Trophy } from 'lucide-react'

type TimeFilter = 'all' | 'month' | 'week'

interface StudentData {
  id: string
  full_name: string
  avatar_url: string | null
  xp_total: number
  badge_count: number
}

interface LeaderboardClientProps {
  students: StudentData[]
  currentUserId: string
  currentUserXP: number
  allBadges: any[]
}

export default function LeaderboardClient({ students, currentUserId, currentUserXP, allBadges }: LeaderboardClientProps) {
  const [filter, setFilter] = useState<TimeFilter>('all')

  const podiumPlayers = students.slice(0, 3).map(s => ({
    name: s.full_name || 'UNKNOWN',
    avatarUrl: s.avatar_url,
    xp: s.xp_total || 0,
    badgeCount: s.badge_count || 0,
    isCurrentUser: s.id === currentUserId,
  }))

  const currentUserRank = students.findIndex(s => s.id === currentUserId) + 1

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-body italic">
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0"></div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 relative z-10">
        <div>
          <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em] bg-yellow-500/10 inline-block px-4 py-1.5 mb-5 border border-yellow-500/20 shadow-glow-yellow font-heading">
            GLOBAL_NETWORK_RANKINGS
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest italic flex items-center font-heading drop-shadow-glow-cyan">
            <span className="w-1.5 h-12 md:h-16 bg-yellow-500 mr-6 shadow-glow-yellow animate-pulse" />
            LEADERBOARD
          </h1>
          <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.2em] mt-5 max-w-2xl leading-relaxed italic border-l-2 border-white/5 pl-6 not-italic font-heading">
            Real-time synchronization of XP rankings across the Master Node. Evaluated performance metrics based on accumulated data streams and modular completion audits.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-heading">
          {/* Time Filters */}
          {(['all', 'month', 'week'] as TimeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 border transition-all duration-300 ${
                filter === f
                  ? 'border-yellow-500 text-black bg-yellow-500 shadow-glow-yellow -rotate-3'
                  : 'border-white/5 text-slate-500 hover:border-white/20 hover:text-white bg-black/40'
              }`}
            >
              {f === 'all' ? 'ALL_TIME' : f === 'month' ? 'THIS_MONTH' : 'THIS_WEEK'}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2">
          <XPBar xp={currentUserXP} />
        </div>
        <div className="bg-black/60 border border-white/5 p-8 flex items-center justify-between shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
          <div className="relative z-10 font-heading">
            <div className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] mb-2">PERSONAL_RANK_SYNC</div>
            <div className="text-5xl font-black text-white mt-2 glitch-text tracking-tighter shadow-glow-cyan italic">
              {currentUserRank > 0 ? `#${currentUserRank > 9 ? currentUserRank : '0' + currentUserRank}` : '—'}
            </div>
          </div>
          <Trophy className="w-12 h-12 text-yellow-500/20 group-hover:text-yellow-500/50 transition-all duration-700 relative z-10 group-hover:scale-125 group-hover:rotate-12" />
        </div>
      </div>

      {/* Podium */}
      {students.length >= 3 && (
        <div className="bg-black/40 border border-white/5 p-8 md:p-12 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0"></div>
          <div className="text-[10px] text-yellow-500/60 font-black font-heading uppercase tracking-[0.4em] text-center mb-10 animate-pulse relative z-10">
            ★ ELITE_COMMAND_UNITS_PODIUM ★
          </div>
          <div className="relative z-10">
            <Podium players={podiumPlayers} />
          </div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="relative z-10 font-heading">
        <div className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shadow-glow-emerald" />
          ACTIVE_SYNCHRONIZATION // {students.length}_NODES_DETECTED
        </div>
        <div className="space-y-3">
          {students.map((student, idx) => (
            <LeaderboardRow
              key={student.id}
              rank={idx + 1}
              name={student.full_name || 'UNKNOWN'}
              avatarUrl={student.avatar_url}
              xp={student.xp_total || 0}
              badgeCount={student.badge_count || 0}
              isCurrentUser={student.id === currentUserId}
              studentId={student.id}
            />
          ))}
        </div>
      </div>

      {/* Badges Section */}
      {allBadges.length > 0 && (
        <div className="relative z-10 font-heading">
          <div className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-glow-yellow" />
            ACHIEVEMENT_DECRYPTION // {allBadges.filter((b: any) => b.earned).length}/{allBadges.length}_STREAMS_UNLOCKED
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allBadges.map((badge: any) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                description={badge.description}
                icon_url={badge.icon_url}
                earned={badge.earned}
                earned_at={badge.earned_at}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
