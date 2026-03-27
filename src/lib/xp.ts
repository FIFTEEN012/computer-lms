// XP & Level System for Computer Science LMS
// ==============================================

export const XP_RULES = {
  ATTEND_CLASS: 2,        // +2 XP: Present in class
  COMPLETE_LESSON: 10,    // +10 XP: Complete a lesson
  PASS_QUIZ: 20,          // +20 XP: Pass a quiz (≥60%)
  PERFECT_QUIZ: 50,       // +50 XP: 100% on a quiz
  SUBMIT_ON_TIME: 5,      // +5 XP: Submit before deadline
  STREAK_5DAY: 15,        // +15 XP: 5-day attendance streak
} as const

export interface LevelInfo {
  level: number
  name: string
  emoji: string
  minXP: number
  maxXP: number       // -1 for last level (infinite)
  progress: number    // 0-100%
  xpInLevel: number   // XP earned within this level
  xpToNext: number    // XP needed for next level (0 for max)
}

const LEVELS = [
  { level: 1, name: 'Seedling',      emoji: '🌱', minXP: 0,    maxXP: 99 },
  { level: 2, name: 'Code Cadet',    emoji: '💻', minXP: 100,  maxXP: 299 },
  { level: 3, name: 'Tech Explorer', emoji: '⚡', minXP: 300,  maxXP: 599 },
  { level: 4, name: 'Debug Master',  emoji: '🔧', minXP: 600,  maxXP: 999 },
  { level: 5, name: 'Code Wizard',   emoji: '🚀', minXP: 1000, maxXP: -1 },
] as const

export function getLevelInfo(xp: number): LevelInfo {
  const totalXP = Math.max(0, xp)

  // Find current level (iterate backwards to find highest match)
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    const lvl = LEVELS[i]
    if (totalXP >= lvl.minXP) {
      const isMaxLevel = lvl.maxXP === -1
      const levelRange = isMaxLevel ? 1 : (lvl.maxXP - lvl.minXP + 1)
      const xpInLevel = totalXP - lvl.minXP
      const progress = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / levelRange) * 100))
      const xpToNext = isMaxLevel ? 0 : (lvl.maxXP + 1 - totalXP)

      return {
        level: lvl.level,
        name: lvl.name,
        emoji: lvl.emoji,
        minXP: lvl.minXP,
        maxXP: lvl.maxXP,
        progress,
        xpInLevel,
        xpToNext: Math.max(0, xpToNext),
      }
    }
  }

  // Fallback (should never happen)
  return {
    level: 1, name: 'Seedling', emoji: '🌱',
    minXP: 0, maxXP: 99, progress: 0, xpInLevel: 0, xpToNext: 100,
  }
}

/** Check if XP gain caused a level up */
export function didLevelUp(oldXP: number, newXP: number): boolean {
  return getLevelInfo(oldXP).level < getLevelInfo(newXP).level
}

/** Get level color for cyberpunk UI */
export function getLevelColor(level: number): string {
  switch (level) {
    case 1: return 'text-emerald-400'
    case 2: return 'text-cyan-400'
    case 3: return 'text-yellow-400'
    case 4: return 'text-orange-400'
    case 5: return 'text-fuchsia-400'
    default: return 'text-slate-400'
  }
}

export function getLevelBorderColor(level: number): string {
  switch (level) {
    case 1: return 'border-emerald-500/50'
    case 2: return 'border-cyan-500/50'
    case 3: return 'border-yellow-500/50'
    case 4: return 'border-orange-500/50'
    case 5: return 'border-fuchsia-500/50'
    default: return 'border-slate-500/50'
  }
}

export function getLevelGlow(level: number): string {
  switch (level) {
    case 1: return 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    case 2: return 'shadow-[0_0_15px_rgba(6,182,212,0.2)]'
    case 3: return 'shadow-[0_0_15px_rgba(234,179,8,0.2)]'
    case 4: return 'shadow-[0_0_15px_rgba(249,115,22,0.2)]'
    case 5: return 'shadow-[0_0_20px_rgba(217,70,239,0.3)]'
    default: return ''
  }
}
