'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const getAdminDb = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Record/Update attendance for multiple students at once (upsert)
export async function recordAttendanceAction(
  classId: string,
  date: string,
  records: { student_id: string; status: string; note?: string }[]
) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify teacher owns this class
  const { data: cls } = await supabase
    .from('classes')
    .select('id')
    .eq('id', classId)
    .eq('teacher_id', user.id)
    .single()
  if (!cls) return { error: 'Class not found or unauthorized' }

  const adminDb = getAdminDb()

  // First, get existing attendance for this date to know who was NOT present before
  const { data: existingRecords } = await adminDb
    .from('attendance')
    .select('student_id, status')
    .eq('class_id', classId)
    .eq('date', date)

  const existingMap = new Map(
    (existingRecords || []).map(r => [r.student_id, r.status])
  )

  // Upsert all records
  const upsertData = records.map(r => ({
    class_id: classId,
    student_id: r.student_id,
    date,
    status: r.status,
    note: r.note || null,
    marked_by: user.id,
  }))

  const { error } = await adminDb
    .from('attendance')
    .upsert(upsertData, { onConflict: 'class_id,student_id,date' })

  if (error) return { error: error.message }

  // Award +2 XP for students newly marked as 'present'
  const { awardXP, checkAndAwardBadges, checkAttendanceStreak } = await import('./gamification')
  
  for (const record of records) {
    const wasPresentBefore = existingMap.get(record.student_id) === 'present'
    if (record.status === 'present' && !wasPresentBefore) {
      await awardXP(record.student_id, 2, 'Attendance: Present', classId)
      
      // Check for 5-day streak bonus
      const hasNewStreak = await checkAttendanceStreak(record.student_id, classId)
      if (hasNewStreak) {
        const streakRef = `streak_5_${classId}_${date}`
        await awardXP(record.student_id, 15, 'Attendance: 5-Day Streak', streakRef)
      }
      
      // Check badges
      await checkAndAwardBadges(record.student_id)
    }
    // If student WAS present but now changed to something else, revoke XP
    if (record.status !== 'present' && wasPresentBefore) {
      await adminDb.from('xp_transactions').insert({
        student_id: record.student_id,
        amount: -2,
        reason: 'Attendance: Status changed from present',
        reference_id: classId,
      })
    }
  }

  revalidatePath(`/teacher/classes/${classId}/attendance`)
  revalidatePath(`/student/leaderboard`)
  return { success: true }
  } catch (err: unknown) {
    console.error('[recordAttendanceAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

// Get attendance data for a specific class and date
export async function getAttendanceByDateAction(classId: string, date: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .eq('date', date)

  return { data: data || [] }
  } catch (err: unknown) {
    console.error('[getAttendanceByDateAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

// Get attendance report for a class (all dates, all students)
export async function getAttendanceReportAction(
  classId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  let query = supabase
    .from('attendance')
    .select('*, profiles!inner(full_name, student_id)')
    .eq('class_id', classId)

  if (startDate) query = query.gte('date', startDate)
  if (endDate) query = query.lte('date', endDate)

  const { data } = await query.order('date', { ascending: false })
  return { data: data || [] }
}

// Get student's own attendance for a class
export async function getStudentAttendanceAction(classId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .eq('student_id', user.id)
    .order('date', { ascending: false })

  return { data: data || [] }
}
