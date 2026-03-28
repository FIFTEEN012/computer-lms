'use client'

import { cn } from '@/lib/utils'
import { Flame } from 'lucide-react'

type DayData = {
  date: string
  active: boolean
  xp: number
  dayOfWeek: number
}

type Props = {
  days: DayData[]
  currentStreak: number
  longestStreak: number
}

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export default function StreakCalendar({ days, currentStreak, longestStreak }: Props) {
  const activeDays = days.filter(d => d.active).length
  const totalXP = days.reduce((sum, d) => sum + d.xp, 0)

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 text-[10px] font-label text-primary-fixed/20 uppercase tracking-tighter">ACTIVITY_MAP</div>

      {/* Header Stats */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-headline font-black text-sm uppercase tracking-widest flex items-center gap-3">
          <span className="w-1 h-5 bg-orange-500"></span>
          STREAK_HEATMAP
        </h3>
        <div className="flex gap-4 font-mono text-[10px] text-on-surface-variant uppercase">
          <span>ACTIVE: <span className="text-tertiary-fixed">{activeDays}/30</span></span>
          <span>XP: <span className="text-primary-fixed">{totalXP}</span></span>
        </div>
      </div>

      {/* Streak Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface-container-lowest p-3 border border-outline-variant/10 flex items-center gap-3">
          <Flame className="w-5 h-5 text-orange-400" />
          <div>
            <div className="font-headline font-black text-xl text-orange-400">{currentStreak}</div>
            <div className="font-label text-[9px] text-outline uppercase tracking-widest">CURRENT</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-3 border border-outline-variant/10 flex items-center gap-3">
          <Flame className="w-5 h-5 text-primary-fixed" />
          <div>
            <div className="font-headline font-black text-xl text-primary-fixed">{longestStreak}</div>
            <div className="font-label text-[9px] text-outline uppercase tracking-widest">RECORD</div>
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map(label => (
          <div key={label} className="text-center font-label text-[8px] text-outline/50 uppercase">
            {label}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty cells for alignment */}
        {days.length > 0 && Array.from({ length: days[0].dayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateObj = new Date(day.date + 'T00:00:00')
          const isToday = day.date === new Date().toISOString().split('T')[0]

          return (
            <div
              key={day.date}
              className={cn(
                'aspect-square flex items-center justify-center text-[8px] font-mono transition-all relative group',
                day.active
                  ? 'bg-tertiary-fixed/30 border border-tertiary-fixed/40 text-tertiary-fixed shadow-[0_0_4px_rgba(121,255,91,0.2)]'
                  : 'bg-surface-container-highest/50 border border-outline-variant/10 text-outline/30',
                isToday && 'ring-1 ring-primary-fixed ring-offset-1 ring-offset-surface-container-low'
              )}
              title={`${day.date}: ${day.active ? `Active (+${day.xp} XP)` : 'Inactive'}`}
            >
              {dateObj.getDate()}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4 font-label text-[9px] text-outline uppercase tracking-widest">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-surface-container-highest/50 border border-outline-variant/10"></div>
          <span>INACTIVE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-tertiary-fixed/30 border border-tertiary-fixed/40"></div>
          <span>ACTIVE</span>
        </div>
      </div>
    </div>
  )
}
