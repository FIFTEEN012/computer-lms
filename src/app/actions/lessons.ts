"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLessonAction(classId: string, title: string) {
  try {
  if (!title || !title.trim()) return { error: "INVALID_PARAMETERS: Title cannot be null." }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "AUTH_TIMEOUT: Re-authenticate to proceed." }

  // Verify ownership boundary natively avoiding RLS blindspots
  const { data: cls } = await supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', user.id).single()
  if (!cls) return { error: "ACCESS_DENIED: Supervisor privileges revoked." }

  // Determine relative tail boundary safely avoiding dirty read conditions
  const { data: lessons } = await supabase
    .from('lessons')
    .select('lesson_order')
    .eq('class_id', classId)
    .order('lesson_order', { ascending: false })
    .limit(1)

  const order = lessons && lessons.length > 0 ? lessons[0].lesson_order + 1 : 1

  const { data, error } = await supabase.from('lessons').insert({
    class_id: classId,
    title: title.trim(),
    lesson_order: order,
    is_published: false
  }).select().single()

  if (error) return { error: "DATABASE_ERROR: " + error.message }
  
  revalidatePath(`/teacher/classes/${classId}/lessons`)
  revalidatePath(`/teacher/classes/${classId}`)
  
  return { success: true, lesson: data }
  } catch (err: unknown) {
    console.error('[createLessonAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function updateLessonOrderAction(classId: string, orderedIds: string[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Loop iterative sequence updates (fine for small <50 arrays overhead)
  let hasErrors = false
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
       .from('lessons')
       .update({ lesson_order: i + 1 })
       .eq('id', orderedIds[i])
       .eq('class_id', classId) // double enforce constraints
       
    if (error) hasErrors = true
  }

  if (hasErrors) return { error: "PARTIAL_FAILURE: Some nodes encountered sequence errors during commit." }

  revalidatePath(`/teacher/classes/${classId}/lessons`)
  return { success: true }
}

export async function updateLessonContentAction(
   lessonId: string, 
   classId: string,
   data: { title?: string, content?: string, description?: string, is_published?: boolean, time_estimated_minutes?: number }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from('lessons').update(data).eq('id', lessonId).eq('class_id', classId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/teacher/lessons/${lessonId}/edit`)
  revalidatePath(`/teacher/classes/${classId}/lessons`)
  return { success: true }
}

export async function deleteLessonAction(lessonId: string, classId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Supabase CASCADE naturally drops lesson_progress arrays if configured. Otherwise handled cleanly.
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId).eq('class_id', classId)
  if (error) return { error: "SEVERANCE_FAILED: " + error.message }

  revalidatePath(`/teacher/classes/${classId}/lessons`)
  revalidatePath(`/teacher/lessons`)
  return { success: true }
}

export async function markLessonCompleteAction(lessonId: string, classId: string) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Prevent double claiming
  const { data: progress } = await supabase
     .from('lesson_progress')
     .select('id, completed_at')
     .eq('lesson_id', lessonId)
     .eq('student_id', user.id)
     .single()

  if (progress && progress.completed_at) {
     return { success: true, alreadyCompleted: true, xpGained: 0, oldXP: 0, newXP: 0, badgesAwarded: [] }
  }

  if (progress) {
     await supabase
       .from('lesson_progress')
       .update({ completed_at: new Date().toISOString() })
       .eq('id', progress.id)
  } else {
     await supabase.from('lesson_progress').insert({
       student_id: user.id,
       lesson_id: lessonId,
       completed_at: new Date().toISOString()
     })
  }

  // Award XP via gamification system
  const { awardXP, checkAndAwardBadges } = await import('./gamification')
  const { oldXP, newXP } = await awardXP(user.id, 10, 'Lesson Completed', lessonId)
  const badgesAwarded = await checkAndAwardBadges(user.id)

  // Update daily streak
  const { checkAndUpdateStreak } = await import('@/lib/streak')
  const streakResult = await checkAndUpdateStreak(user.id, 'lesson', 10)

  revalidatePath(`/student/classes/${classId}`)
  revalidatePath(`/student/lessons/${lessonId}`)
  revalidatePath(`/student/dashboard`)
  revalidatePath(`/student/leaderboard`)

  return { success: true, xpGained: 10, oldXP, newXP, badgesAwarded, streak: streakResult }
  } catch (err: unknown) {
    console.error('[markLessonCompleteAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function awardCodePlaygroundXP(lessonId: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { awardXP } = await import('./gamification')
    const adminDb = (await import('@supabase/supabase-js')).createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Only award once per lesson per student
    const { data: existing } = await adminDb
      .from('xp_transactions')
      .select('id')
      .eq('student_id', user.id)
      .eq('reason', 'code_playground')
      .eq('reference_id', lessonId)
      .limit(1)

    if (existing && existing.length > 0) {
      return { success: true, alreadyAwarded: true, xpGained: 0 }
    }

    const { oldXP, newXP } = await awardXP(user.id, 5, 'code_playground', lessonId)

    // Update daily streak
    const { checkAndUpdateStreak } = await import('@/lib/streak')
    const streakResult = await checkAndUpdateStreak(user.id, 'code_run', 5)

    revalidatePath('/student/dashboard')
    revalidatePath('/student/leaderboard')

    return { success: true, xpGained: 5, oldXP, newXP, streak: streakResult }
  } catch (err: unknown) {
    console.error('[awardCodePlaygroundXP]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
