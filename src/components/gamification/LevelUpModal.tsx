'use client'

import { useEffect, useState, useCallback } from 'react'
import { getLevelInfo, getLevelColor } from '@/lib/xp'
import confetti from 'canvas-confetti'

interface LevelUpModalProps {
  oldXP: number
  newXP: number
  xpGained: number
  badgesAwarded?: string[]
  onClose: () => void
}

export default function LevelUpModal({ oldXP, newXP, xpGained, badgesAwarded = [], onClose }: LevelUpModalProps) {
  const [visible, setVisible] = useState(false)
  const oldLevel = getLevelInfo(oldXP)
  const newLevel = getLevelInfo(newXP)
  const didLevelUp = newLevel.level > oldLevel.level

  const fireConfetti = useCallback(() => {
    // Burst from center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#eab308', '#f97316', '#d946ef', '#ffffff'],
    })
    // Side cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#06b6d4', '#eab308'],
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f97316', '#d946ef', '#ffffff'],
      })
    }, 300)
  }, [])

  useEffect(() => {
    setVisible(true)
    if (didLevelUp) {
      fireConfetti()
      const timer = setTimeout(fireConfetti, 1500)
      return () => clearTimeout(timer)
    }
  }, [didLevelUp, fireConfetti])

  const colorClass = getLevelColor(newLevel.level)

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-700 font-heading italic ${visible ? 'opacity-100 backdrop-blur-md' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-[0.1] pointer-events-none z-0"></div>

      {/* Modal */}
      <div
        className={`relative bg-black border-2 ${didLevelUp ? 'border-yellow-500 shadow-glow-yellow' : 'border-primary shadow-glow-cyan'} p-10 md:p-16 max-w-lg w-full mx-4 text-center transition-all duration-1000 transform ${visible ? 'scale-100 translate-y-0 translate-x-0 rotate-0' : 'scale-75 translate-y-24 translate-x-12 rotate-12'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
        
        {/* Top glow */}
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${didLevelUp ? 'from-yellow-500 via-orange-500 to-fuchsia-500' : 'from-primary to-emerald-500'} shadow-lg`} />

        {/* Emoji & Level */}
        <div className={`text-7xl md:text-9xl mb-8 transform transition-transform duration-1000 ${didLevelUp ? 'animate-bounce drop-shadow-glow-yellow' : 'drop-shadow-glow-cyan'}`}>
          {newLevel.emoji}
        </div>

        {didLevelUp ? (
          <>
            <div className="text-[12px] text-yellow-500 font-black uppercase tracking-[0.4em] mb-3 animate-pulse">
              ⟨ SYSTEM_EVOLUTION_DETECTED ⟩
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest italic mb-2 glitch-text leading-tight">
              {newLevel.name}
            </h2>
            <div className={`text-base md:text-xl ${colorClass} font-black tracking-[0.3em] uppercase mt-2`}>
              SYNC_LEVEL_0{newLevel.level}
            </div>
          </>
        ) : (
          <>
            <div className="text-[12px] text-primary font-black uppercase tracking-[0.4em] mb-4">
              ⟨ DATA_STREAM_ABSORBED ⟩
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest italic mb-2 glitch-text leading-tight drop-shadow-glow-cyan">
              +{xpGained}_XP
            </h2>
          </>
        )}

        {/* XP counter */}
        <div className="mt-10 bg-white/[0.03] border border-white/5 p-6 backdrop-blur-xl relative group">
          <div className="flex justify-between items-end mb-4 font-heading">
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">INTEGRATED_XP_TOTAL</span>
            <span className="text-3xl text-white font-black italic tracking-tighter text-shadow-neon-cyan">{newXP.toLocaleString()}</span>
          </div>
          {/* XP Bar */}
          <div className="h-3 w-full bg-white/5 border border-white/5 relative overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-1500 ease-out shadow-glow-cyan relative z-10`}
              style={{ width: `${newLevel.progress}%` }}
            />
            <div className="absolute inset-0 scanlines opacity-[0.3] pointer-events-none z-20" />
          </div>
          <div className="flex justify-between mt-3 font-heading text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="text-slate-600">{newLevel.progress}%_SYNCED</span>
            <span className="text-slate-600">
              {newLevel.xpToNext > 0 ? `${newLevel.xpToNext}_XP_UNTIL_NEXT_UPGRADE` : 'PEAK_PERFORMANCE'}
            </span>
          </div>
        </div>

        {/* Badges awarded */}
        {badgesAwarded.length > 0 && (
          <div className="mt-8 border border-yellow-500/30 bg-yellow-500/5 p-6 animate-in slide-in-from-bottom duration-1000 relative">
            <div className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.4em] mb-4">
              ★ NEW_ACHIEVEMENTS_EARNED ★
            </div>
            <div className="space-y-3">
              {badgesAwarded.map((name) => (
                <div key={name} className="text-base md:text-xl text-yellow-400 font-black uppercase tracking-widest flex items-center justify-center gap-3 drop-shadow-glow-yellow">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
                  🏅 {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-10 w-full h-14 bg-white/5 hover:bg-white hover:text-black text-white font-black text-[11px] uppercase tracking-[0.5em] transition-all duration-500 border border-white/10 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 font-heading">RESUME_OPERATIONS →</span>
        </button>
        
        <div className="absolute bottom-0 right-0 p-4 opacity-5 pointer-events-none text-white font-heading text-8xl font-black italic select-none">UPGRADE</div>
      </div>
    </div>
  )
}
