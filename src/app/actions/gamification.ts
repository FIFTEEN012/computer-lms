'use server'

import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function getAdminDb() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================
// Core XP Award Function
// ============================================================
export async function awardXP(
  studentId: string,
  amount: number,
  reason: string,
  referenceId?: string
): Promise<{ oldXP: number; newXP: number; error?: string }> {
  try {
  const adminDb = getAdminDb()

  // Get current XP before insert
  const { data: profile } = await adminDb
    .from('profiles')
    .select('xp_total')
    .eq('id', studentId)
    .single()

  const oldXP = profile?.xp_total || 0

  // Insert XP transaction (trigger will auto-update profiles.xp_total)
  await adminDb.from('xp_transactions').insert({
    student_id: studentId,
    amount,
    reason,
    reference_id: referenceId || null,
  })

  const newXP = oldXP + amount
  return { oldXP, newXP }
  } catch (err: unknown) {
    console.error('[awardXP]', err)
    return { oldXP: 0, newXP: 0, error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

// ============================================================
// Badge Auto-Award System
// ============================================================
export async function checkAndAwardBadges(studentId: string): Promise<string[]> {
  try {
  const adminDb = getAdminDb()
  const awarded: string[] = []

  // Fetch all badges and which ones the student already has
  const { data: allBadges } = await adminDb.from('badges').select('*')
  const { data: earnedBadges } = await adminDb
    .from('student_badges')
    .select('badge_id')
    .eq('student_id', studentId)

  if (!allBadges) return awarded

  const earnedSet = new Set((earnedBadges || []).map(b => b.badge_id))
  const unearned = allBadges.filter(b => !earnedSet.has(b.id))

  if (unearned.length === 0) return awarded

  // Gather all stats for this student
  const stats = await getStudentStats(studentId)

  for (const badge of unearned) {
    let qualified = false

    switch (badge.condition_type) {
      case 'lessons_completed':
        qualified = stats.lessonsCompleted >= (badge.condition_value || 1)
        break
      case 'perfect_quiz':
        qualified = stats.perfectQuizzes >= (badge.condition_value || 1)
        break
      case 'attendance_streak':
        qualified = stats.maxAttendanceStreak >= (badge.condition_value || 7)
        break
      case 'quizzes_passed':
        qualified = stats.quizzesPassed >= (badge.condition_value || 10)
        break
      case 'speed_quiz':
        qualified = stats.hasSpeedQuiz
        break
      case 'classes_enrolled':
        qualified = stats.classesEnrolled >= (badge.condition_value || 3)
        break
      case 'top3_leaderboard':
        qualified = stats.leaderboardRank <= 3 && stats.leaderboardRank > 0
        break
    }

    if (qualified) {
      const { error } = await adminDb.from('student_badges').insert({
        student_id: studentId,
        badge_id: badge.id,
      })
      if (!error) awarded.push(badge.name)
    }
  }

  return awarded
  } catch (err: unknown) {
    console.error('[checkAndAwardBadges]', err)
    return []
  }
}

// ============================================================
// Stats Query Helper
// ============================================================
async function getStudentStats(studentId: string) {
  const adminDb = getAdminDb()

  // Lessons completed
  const { count: lessonsCompleted } = await adminDb
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .not('completed_at', 'is', null)

  // Quiz attempts (passed = score/max_score >= 0.6)
  const { data: quizAttempts } = await adminDb
    .from('quiz_attempts')
    .select('score, max_score, started_at, submitted_at')
    .eq('student_id', studentId)
    .not('submitted_at', 'is', null)

  let quizzesPassed = 0
  let perfectQuizzes = 0
  let hasSpeedQuiz = false

  for (const a of quizAttempts || []) {
    if (a.max_score && a.max_score > 0) {
      const pct = (a.score || 0) / a.max_score
      if (pct >= 0.6) quizzesPassed++
      if (pct >= 1.0) perfectQuizzes++
    }
    // Speed quiz: completed in under 5 minutes
    if (a.started_at && a.submitted_at) {
      const duration = (new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()) / 60000
      if (duration < 5 && duration > 0) hasSpeedQuiz = true
    }
  }

  // Attendance streak
  const { data: attendanceRecords } = await adminDb
    .from('attendance')
    .select('date, status')
    .eq('student_id', studentId)
    .in('status', ['present', 'late'])
    .order('date', { ascending: true })

  let maxAttendanceStreak = 0
  let currentStreak = 0
  let lastDate: Date | null = null

  for (const rec of attendanceRecords || []) {
    const d = new Date(rec.date)
    if (lastDate) {
      const diff = (d.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        currentStreak++
      } else if (diff > 1) {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
    maxAttendanceStreak = Math.max(maxAttendanceStreak, currentStreak)
    lastDate = d
  }

  // Classes enrolled
  const { count: classesEnrolled } = await adminDb
    .from('class_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)

  // Leaderboard rank
  const { data: allStudents } = await adminDb
    .from('profiles')
    .select('id, xp_total')
    .eq('role', 'student')
    .order('xp_total', { ascending: false })

  let leaderboardRank = 0
  if (allStudents) {
    const idx = allStudents.findIndex(s => s.id === studentId)
    leaderboardRank = idx >= 0 ? idx + 1 : 0
  }

  return {
    lessonsCompleted: lessonsCompleted || 0,
    quizzesPassed,
    perfectQuizzes,
    hasSpeedQuiz,
    maxAttendanceStreak,
    classesEnrolled: classesEnrolled || 0,
    leaderboardRank,
  }
}

// ============================================================
// Fetch student's badges with badge details
// ============================================================
export async function getStudentBadges(studentId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('student_badges')
    .select('*, badges(*)')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false })

  return data || []
}

// ============================================================
// Fetch all badges with earned status for a student
// ============================================================
export async function getAllBadgesWithStatus(studentId: string) {
  const adminDb = getAdminDb()

  const { data: allBadges } = await adminDb.from('badges').select('*')
  const { data: earned } = await adminDb
    .from('student_badges')
    .select('badge_id, earned_at')
    .eq('student_id', studentId)

  const earnedMap = new Map((earned || []).map(e => [e.badge_id, e.earned_at]))

  return (allBadges || []).map(badge => ({
    ...badge,
    earned: earnedMap.has(badge.id),
    earned_at: earnedMap.get(badge.id) || null,
  }))
}

// ============================================================
// Detect 5-day attendance streak for XP bonus
// ============================================================
export async function checkAttendanceStreak(studentId: string, classId: string): Promise<boolean> {
  try {
  const adminDb = getAdminDb()

  const { data: records } = await adminDb
    .from('attendance')
    .select('date')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .in('status', ['present', 'late'])
    .order('date', { ascending: false })
    .limit(5)

  if (!records || records.length < 5) return false

  // Check if the 5 most recent dates form a consecutive run
  const dates = records.map(r => new Date(r.date).getTime()).sort((a, b) => b - a)
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24)
    if (diff > 1) return false
  }

  // Check if this streak was already rewarded
  const streakRef = `streak_5_${classId}_${records[0].date}`
  const { data: existing } = await adminDb
    .from('xp_transactions')
    .select('id')
    .eq('student_id', studentId)
    .eq('reason', 'Attendance: 5-Day Streak')
    .eq('reference_id', streakRef)
    .limit(1)

  return !existing || existing.length === 0
  } catch (err: unknown) {
    console.error('[checkAttendanceStreak]', err)
    return false
  }
}
