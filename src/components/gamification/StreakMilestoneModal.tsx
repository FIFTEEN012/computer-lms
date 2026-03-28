'use client'

import { useEffect, useState, useCallback } from 'react'
import { Flame, X, Copy, Check } from 'lucide-react'
import confetti from 'canvas-confetti'

type Props = {
  streakCount: number
  milestoneDay: number
  xpBonus: number
  onClose: () => void
}

const MILESTONE_CONFIG: Record<number, { emoji: string; title: string; subtitle: string; color: string }> = {
  3: { emoji: '🔥', title: 'ON_FIRE', subtitle: 'เข้าใช้งานต่อเนื่อง 3 วัน!', color: 'text-orange-400' },
  7: { emoji: '🔥', title: 'WEEKLY_WARRIOR', subtitle: 'เข้าใช้งานต่อเนื่อง 7 วันเต็ม!', color: 'text-orange-500' },
  30: { emoji: '🌟', title: 'DEDICATED_LEARNER', subtitle: 'เข้าใช้งานต่อเนื่องครบ 1 เดือน!', color: 'text-yellow-400' },
  100: { emoji: '💎', title: 'UNSTOPPABLE', subtitle: '100 วันต่อเนื่อง! คุณเป็นตำนาน!', color: 'text-cyan-400' },
}

export default function StreakMilestoneModal({ streakCount, milestoneDay, xpBonus, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [xpDisplay, setXpDisplay] = useState(0)

  const config = MILESTONE_CONFIG[milestoneDay] || MILESTONE_CONFIG[3]

  // Confetti burst on mount
  useEffect(() => {
    const duration = 2000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff6b00', '#ffaa00', '#00fbfb', '#ff00ff'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff6b00', '#ffaa00', '#00fbfb', '#ff00ff'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [])

  // Animate XP counter
  useEffect(() => {
    const steps = 30
    const increment = xpBonus / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= xpBonus) {
        setXpDisplay(xpBonus)
        clearInterval(interval)
      } else {
        setXpDisplay(Math.floor(current))
      }
    }, 40)
    return () => clearInterval(interval)
  }, [xpBonus])

  const handleShare = useCallback(async () => {
    const text = `${config.emoji} ฉันเข้าใช้งาน Kinetic Terminal ต่อเนื่อง ${streakCount} วันแล้ว! +${xpBonus} XP #KineticTerminal #LearningStreak`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [streakCount, xpBonus, config.emoji])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-surface-container-low border border-outline-variant/30 w-full max-w-md mx-4 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="scanline-overlay absolute inset-0 opacity-[0.04] pointer-events-none" />

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-outline hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative z-10 p-8 text-center space-y-6">
          {/* Emoji + Title */}
          <div className="space-y-2">
            <div className="text-6xl">{config.emoji}</div>
            <div className={`font-headline font-black text-3xl tracking-[0.2em] uppercase ${config.color}`}>
              {config.title}
            </div>
            <div className="font-label text-sm text-on-surface-variant">
              {config.subtitle}
            </div>
          </div>

          {/* Streak Count */}
          <div className="flex items-center justify-center gap-3 py-4">
            <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
            <span className="font-headline font-black text-6xl text-white tabular-nums">
              {streakCount}
            </span>
            <span className="font-headline font-bold text-lg text-outline uppercase tracking-widest self-end pb-2">
              DAYS
            </span>
          </div>

          {/* XP Bonus */}
          <div className="bg-surface-container-lowest border border-primary-fixed/20 p-4 inline-flex items-center gap-3">
            <span className="font-label text-[10px] text-outline uppercase tracking-widest">BONUS_XP</span>
            <span className="font-headline font-black text-2xl text-primary-fixed">
              +{xpDisplay}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleShare}
              className="flex-1 py-3 border border-outline-variant/30 font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-tertiary-fixed" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'SHARE_STREAK'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-primary-fixed text-on-primary-fixed font-headline font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_0_20px_#00fbfb] transition-all"
            >
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
