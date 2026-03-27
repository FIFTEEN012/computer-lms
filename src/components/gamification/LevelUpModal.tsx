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
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative bg-[#0e0e0e] border-2 ${didLevelUp ? 'border-yellow-500' : 'border-emerald-500/50'} p-8 md:p-12 max-w-md w-full mx-4 text-center transition-all duration-700 ${visible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glow */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${didLevelUp ? 'from-yellow-500 via-orange-500 to-fuchsia-500' : 'from-emerald-500 to-cyan-500'}`} />

        {/* Emoji & Level */}
        <div className={`text-6xl md:text-8xl mb-4 ${didLevelUp ? 'animate-bounce' : ''}`}>
          {newLevel.emoji}
        </div>

        {didLevelUp ? (
          <>
            <div className="font-mono text-[10px] text-yellow-500 uppercase tracking-widest mb-2 animate-pulse">
              ⟨ LEVEL_UP ⟩
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic mb-1">
              {newLevel.name}
            </h2>
            <div className={`font-mono text-sm ${colorClass} font-bold`}>
              LEVEL {newLevel.level}
            </div>
          </>
        ) : (
          <>
            <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mb-2">
              ⟨ XP_GAINED ⟩
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-1">
              +{xpGained} XP
            </h2>
          </>
        )}

        {/* XP counter */}
        <div className="mt-6 bg-[#1a1a1a] border border-slate-800 p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">TOTAL_XP</span>
            <span className="font-mono text-lg text-white font-black">{newXP.toLocaleString()}</span>
          </div>
          {/* XP Bar */}
          <div className="h-2 w-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]`}
              style={{ width: `${newLevel.progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[8px] text-slate-600">{newLevel.progress}%</span>
            <span className="font-mono text-[8px] text-slate-600">
              {newLevel.xpToNext > 0 ? `${newLevel.xpToNext} XP TO LV${newLevel.level + 1}` : 'MAX'}
            </span>
          </div>
        </div>

        {/* Badges awarded */}
        {badgesAwarded.length > 0 && (
          <div className="mt-4 border border-yellow-500/30 bg-yellow-500/5 p-3">
            <div className="font-mono text-[9px] text-yellow-500 uppercase tracking-widest mb-2">
              NEW_BADGES_UNLOCKED
            </div>
            {badgesAwarded.map((name) => (
              <div key={name} className="font-sans text-sm text-yellow-400 font-bold">
                🏅 {name}
              </div>
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full h-10 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] uppercase tracking-widest transition-colors border border-slate-700"
        >
          CONTINUE →
        </button>
      </div>
    </div>
  )
}
