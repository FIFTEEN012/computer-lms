'use client'

import { Flame, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Props = {
  currentStreak: number
  isActiveToday: boolean
  role?: string
}

export default function DailyGoalWidget({ currentStreak, isActiveToday, role = 'student' }: Props) {
  return (
    <div className="bg-surface-container-low p-6 border border-outline-variant/10 relative overflow-hidden group transition-all duration-300 hover:bg-surface-container-high">
      <div className="absolute top-0 right-0 p-2 text-orange-500/10 font-mono text-4xl font-black">
        <Flame className="w-12 h-12" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-black text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-5 bg-orange-500"></span>
            DAILY_GOAL
          </h3>
          <div className="flex items-center gap-1.5">
            <Flame className={cn(
              'w-4 h-4',
              currentStreak > 0 ? 'text-orange-400' : 'text-outline/30'
            )} />
            <span className={cn(
              'font-headline font-black text-lg tabular-nums',
              currentStreak > 0 ? 'text-orange-400' : 'text-outline/40'
            )}>
              {currentStreak}
            </span>
          </div>
        </div>

        {/* Goal Status */}
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 flex items-center justify-center border transition-all',
            isActiveToday
              ? 'bg-tertiary-fixed/10 border-tertiary-fixed/30 text-tertiary-fixed'
              : 'bg-surface-container-highest border-outline-variant/20 text-outline/40'
          )}>
            {isActiveToday ? (
              <Check className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            )}
          </div>
          <div className="flex-1">
            <div className={cn(
              'font-headline font-bold text-xs uppercase tracking-widest',
              isActiveToday ? 'text-tertiary-fixed' : 'text-on-surface-variant'
            )}>
              {isActiveToday ? 'GOAL_ACHIEVED' : 'GOAL_PENDING'}
            </div>
            <div className="font-label text-[10px] text-outline mt-0.5">
              {isActiveToday
                ? 'ทำกิจกรรมแล้ววันนี้ — streak ปลอดภัย!'
                : 'เรียน 1 บทเรียน หรือ ทำแบบทดสอบ เพื่อรักษา streak'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-surface-container-highest overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-700',
                isActiveToday
                  ? 'bg-tertiary-fixed w-full shadow-[0_0_8px_rgba(121,255,91,0.3)]'
                  : 'bg-orange-500/50 w-0'
              )}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-outline uppercase">
            <span>{isActiveToday ? 'COMPLETE' : '0/1 ACTIVITY'}</span>
            <span>1 ACTIVITY</span>
          </div>
        </div>

        {/* CTA if not active */}
        {!isActiveToday && (
          <Link
            href={`/${role}/classes`}
            className="block w-full py-2.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-headline font-bold text-[10px] uppercase tracking-widest text-center hover:bg-orange-500/20 transition-all"
          >
            START_LEARNING_NOW
          </Link>
        )}
      </div>
    </div>
  )
}
