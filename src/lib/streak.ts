'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'

function getAdminDb() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type StreakResult = {
  streakCount: number
  longestStreak: number
  isNewDay: boolean
  isMilestone: boolean
  milestoneDay?: number
  xpBonus: number
  error?: string
}

type ActivityType = 'lesson' | 'quiz' | 'attendance' | 'code_run'

const MILESTONES: { days: number; xp: number; badgeName?: string; badgeDescription?: string; badgeConditionType?: string }[] = [
  { days: 3, xp: 15 },
  { days: 7, xp: 30, badgeName: '🔥 On Fire', badgeDescription: 'เข้าใช้งานต่อเนื่อง 7 วัน', badgeConditionType: 'daily_streak' },
  { days: 30, xp: 100, badgeName: '🌟 Dedicated Learner', badgeDescription: 'เข้าใช้งานต่อเนื่อง 30 วัน', badgeConditionType: 'daily_streak_30' },
  { days: 100, xp: 500, badgeName: '💎 Unstoppable', badgeDescription: 'เข้าใช้งานต่อเนื่อง 100 วัน', badgeConditionType: 'daily_streak_100' },
]

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z')
  const d2 = new Date(dateStr2 + 'T00:00:00Z')
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export async function checkAndUpdateStreak(
  studentId: string,
  activityType: ActivityType,
  xpFromActivity: number = 0
): Promise<StreakResult> {
  try {
    const adminDb = getAdminDb()
    const today = toDateStr(new Date())

    // 1. Get student's current streak data
    const { data: profile } = await adminDb
      .from('profiles')
      .select('current_streak, longest_streak, last_active_date, streak_frozen_until')
      .eq('id', studentId)
      .single()

    if (!profile) return { streakCount: 0, longestStreak: 0, isNewDay: false, isMilestone: false, xpBonus: 0, error: 'Profile not found' }

    const lastActive = profile.last_active_date as string | null
    const frozenUntil = profile.streak_frozen_until as string | null

    // 2. Record daily activity (upsert — idempotent, accumulates xp)
    await adminDb
      .from('daily_activity')
      .upsert(
        {
          student_id: studentId,
          activity_date: today,
          activity_type: activityType,
          xp_earned: xpFromActivity,
        },
        { onConflict: 'student_id,activity_date' }
      )

    // 3. If already active today — no streak change
    if (lastActive === today) {
      return {
        streakCount: profile.current_streak,
        longestStreak: profile.longest_streak,
        isNewDay: false,
        isMilestone: false,
        xpBonus: 0,
      }
    }

    // 4. Calculate new streak
    let newStreak: number

    if (!lastActive) {
      // First ever activity
      newStreak = 1
    } else {
      const gap = daysBetween(lastActive, today)

      if (gap === 1) {
        // Consecutive day
        newStreak = profile.current_streak + 1
      } else if (gap > 1) {
        // Check freeze protection
        const isFrozen = frozenUntil && frozenUntil >= today
        if (isFrozen && gap <= 2) {
          newStreak = profile.current_streak + 1
        } else {
          // Streak broken — reset
          newStreak = 1
        }
      } else {
        // gap <= 0 (same day or future — shouldn't happen but be safe)
        newStreak = profile.current_streak
      }
    }

    const newLongest = Math.max(newStreak, profile.longest_streak)

    // 5. Check milestones
    let xpBonus = 0
    let isMilestone = false
    let milestoneDay: number | undefined

    const milestone = MILESTONES.find(m => m.days === newStreak)
    if (milestone) {
      isMilestone = true
      milestoneDay = milestone.days
      xpBonus = milestone.xp

      // Award XP bonus
      await adminDb.from('xp_transactions').insert({
        student_id: studentId,
        amount: xpBonus,
        reason: `streak_milestone_${milestone.days}`,
      })

      // Update xp_total on profile
      await adminDb.rpc('', {}).catch(() => {})
      const { data: currentProfile } = await adminDb
        .from('profiles')
        .select('xp_total')
        .eq('id', studentId)
        .single()
      await adminDb
        .from('profiles')
        .update({ xp_total: (currentProfile?.xp_total || 0) + xpBonus })
        .eq('id', studentId)

      // Award streak badge if applicable
      if (milestone.badgeName) {
        await ensureStreakBadge(studentId, milestone.badgeName, milestone.badgeDescription!, milestone.badgeConditionType!, milestone.days)
      }
    }

    // 6. Update profile with new streak data
    await adminDb
      .from('profiles')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
      })
      .eq('id', studentId)

    return {
      streakCount: newStreak,
      longestStreak: newLongest,
      isNewDay: true,
      isMilestone,
      milestoneDay,
      xpBonus,
    }
  } catch (err: unknown) {
    console.error('[checkAndUpdateStreak]', err)
    return { streakCount: 0, longestStreak: 0, isNewDay: false, isMilestone: false, xpBonus: 0, error: String(err) }
  }
}

async function ensureStreakBadge(
  studentId: string,
  badgeName: string,
  badgeDescription: string,
  conditionType: string,
  conditionValue: number
) {
  const adminDb = getAdminDb()

  // Find or create the badge
  let { data: badge } = await adminDb
    .from('badges')
    .select('id')
    .eq('condition_type', conditionType)
    .single()

  if (!badge) {
    const { data: newBadge } = await adminDb
      .from('badges')
      .insert({
        name: badgeName,
        description: badgeDescription,
        condition_type: conditionType,
        condition_value: conditionValue,
      })
      .select('id')
      .single()
    badge = newBadge
  }

  if (!badge) return

  // Check if already awarded
  const { data: existing } = await adminDb
    .from('student_badges')
    .select('id')
    .eq('student_id', studentId)
    .eq('badge_id', badge.id)
    .limit(1)

  if (existing && existing.length > 0) return

  await adminDb.from('student_badges').insert({
    student_id: studentId,
    badge_id: badge.id,
  })
}

// Fetch streak info for display (client-facing)
export async function getStreakData(studentId: string) {
  const adminDb = getAdminDb()

  const { data: profile } = await adminDb
    .from('profiles')
    .select('current_streak, longest_streak, last_active_date, streak_frozen_until')
    .eq('id', studentId)
    .single()

  if (!profile) return { currentStreak: 0, longestStreak: 0, isActiveToday: false, lastActiveDate: null }

  const today = toDateStr(new Date())
  const isActiveToday = profile.last_active_date === today

  // Check if streak is still valid (not broken since last active)
  let displayStreak = profile.current_streak
  if (profile.last_active_date && !isActiveToday) {
    const gap = daysBetween(profile.last_active_date as string, today)
    const isFrozen = profile.streak_frozen_until && (profile.streak_frozen_until as string) >= today
    if (gap > 1 && !(isFrozen && gap <= 2)) {
      displayStreak = 0 // Streak has been broken but not yet updated
    }
  }

  return {
    currentStreak: displayStreak,
    longestStreak: profile.longest_streak,
    isActiveToday,
    lastActiveDate: profile.last_active_date,
  }
}

// Fetch last 30 days of activity for calendar heatmap
export async function getActivityHeatmap(studentId: string) {
  const adminDb = getAdminDb()
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)

  const { data } = await adminDb
    .from('daily_activity')
    .select('activity_date, activity_type, xp_earned')
    .eq('student_id', studentId)
    .gte('activity_date', toDateStr(thirtyDaysAgo))
    .lte('activity_date', toDateStr(today))
    .order('activity_date', { ascending: true })

  // Build map of date → activity
  const activityMap: Record<string, { type: string; xp: number }> = {}
  for (const row of data || []) {
    activityMap[row.activity_date] = { type: row.activity_type, xp: row.xp_earned }
  }

  // Generate all 30 days
  const days: { date: string; active: boolean; xp: number; dayOfWeek: number }[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(d.getDate() + i)
    const dateStr = toDateStr(d)
    const activity = activityMap[dateStr]
    days.push({
      date: dateStr,
      active: !!activity,
      xp: activity?.xp || 0,
      dayOfWeek: d.getDay(),
    })
  }

  return days
}

// Check if student has done any activity today (for DailyGoalWidget)
export async function getTodayActivity(studentId: string) {
  const adminDb = getAdminDb()
  const today = toDateStr(new Date())

  const { data } = await adminDb
    .from('daily_activity')
    .select('activity_type, xp_earned')
    .eq('student_id', studentId)
    .eq('activity_date', today)
    .limit(1)

  return {
    hasActivity: !!data && data.length > 0,
    activityType: data?.[0]?.activity_type || null,
    xpEarned: data?.[0]?.xp_earned || 0,
  }
}
