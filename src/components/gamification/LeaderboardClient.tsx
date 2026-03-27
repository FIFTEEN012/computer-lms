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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="font-mono text-[10px] text-yellow-500 uppercase tracking-widest bg-yellow-500/10 inline-block px-3 py-1 mb-3">
            GLOBAL_RANKINGS
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic flex items-center">
            <span className="w-3 h-10 md:h-14 bg-yellow-500 mr-4" />
            LEADERBOARD
          </h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-3 max-w-xl leading-relaxed">
            Real-time XP rankings across the entire network. Top performers are displayed with their accumulated experience points.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Time Filters */}
          {(['all', 'month', 'week'] as TimeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-mono text-[10px] uppercase tracking-widest px-4 py-2 border transition-all ${
                filter === f
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  : 'border-slate-800 text-slate-500 hover:border-slate-600 hover:text-white'
              }`}
            >
              {f === 'all' ? 'ALL_TIME' : f === 'month' ? 'THIS_MONTH' : 'THIS_WEEK'}
            </button>
          ))}
        </div>
      </div>

      {/* Current User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <XPBar xp={currentUserXP} />
        </div>
        <div className="bg-[#131313] border border-slate-800 p-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">YOUR_RANK</div>
            <div className="font-sans font-black text-3xl text-white mt-1">
              {currentUserRank > 0 ? `#${currentUserRank}` : '—'}
            </div>
          </div>
          <Trophy className="w-8 h-8 text-yellow-500/30" />
        </div>
      </div>

      {/* Podium */}
      {students.length >= 3 && (
        <div className="bg-[#0e0e0e] border border-slate-800 p-4 md:p-6">
          <div className="font-mono text-[10px] text-yellow-500/60 uppercase tracking-widest text-center mb-2">
            ★ TOP_3_COMMANDERS ★
          </div>
          <Podium players={podiumPlayers} />
        </div>
      )}

      {/* Full Ranking List */}
      <div>
        <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
          FULL_RANKING // {students.length} NODES
        </div>
        <div className="space-y-2">
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
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500" />
            YOUR_BADGES // {allBadges.filter((b: any) => b.earned).length}/{allBadges.length} UNLOCKED
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
