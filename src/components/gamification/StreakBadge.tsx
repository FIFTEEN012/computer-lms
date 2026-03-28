'use client'

import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type Props = {
  streak: number
  isActiveToday: boolean
}

export default function StreakBadge({ streak, isActiveToday }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)

  const hasStreak = streak > 0

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 border transition-all duration-300 font-headline text-xs font-black tracking-wider uppercase',
        hasStreak
          ? 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
          : 'border-outline-variant/20 bg-surface-container-low text-outline hover:bg-surface-container-high'
      )}>
        <Flame className={cn(
          'w-4 h-4 transition-all',
          hasStreak && 'text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]',
          hasStreak && isActiveToday && 'animate-pulse',
          !hasStreak && 'text-outline/40'
        )} />
        <span className={cn(
          'tabular-nums',
          hasStreak ? 'text-orange-300' : 'text-outline/60'
        )}>
          {streak}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 z-50 pointer-events-none">
          <div className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 shadow-2xl backdrop-blur-xl min-w-[180px]">
            <div className="font-headline text-[10px] tracking-widest uppercase text-outline mb-1">
              STREAK_STATUS
            </div>
            {hasStreak ? (
              <>
                <div className="font-headline font-black text-orange-400 text-lg">
                  {streak} {streak === 1 ? 'DAY' : 'DAYS'}
                </div>
                <div className="text-[10px] text-on-surface-variant font-label mt-1">
                  {isActiveToday
                    ? 'วันนี้เช็คอินแล้ว! ทำต่อไปนะ'
                    : 'ยังไม่ได้ทำกิจกรรมวันนี้! อย่าให้ streak หาย'}
                </div>
              </>
            ) : (
              <div className="text-[10px] text-on-surface-variant font-label">
                ยังไม่มี streak เริ่มเรียนวันนี้เลย!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
