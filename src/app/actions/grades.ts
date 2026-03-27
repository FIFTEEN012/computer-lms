'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { GRADE_WEIGHTS, getGradeLetter, getGradeColor, calculateWeightedScore } from '@/lib/utils/grades'

const getAdminDb = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Save/update a grade entry (upsert)
export async function saveGradeAction(
  classId: string,
  studentId: string,
  category: string,
  title: string,
  score: number,
  maxScore: number,
  weight?: number
) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const adminDb = getAdminDb()

  // Check if grade already exists for this student/class/category/title
  const { data: existing } = await adminDb
    .from('grades')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', studentId)
    .eq('category', category)
    .eq('title', title)
    .single()

  if (existing) {
    const { error } = await adminDb
      .from('grades')
      .update({ score, max_score: maxScore, weight: weight || 1.0, recorded_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await adminDb
      .from('grades')
      .insert({ class_id: classId, student_id: studentId, category, title, score, max_score: maxScore, weight: weight || 1.0 })
    if (error) return { error: error.message }
  }

  revalidatePath(`/teacher/classes/${classId}/grades`)
  return { success: true }
  } catch (err: unknown) {
    console.error('[saveGradeAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

// Bulk save grades for a category
export async function bulkSaveGradesAction(
  classId: string,
  category: string,
  title: string,
  entries: { student_id: string; score: number; max_score: number }[]
) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const adminDb = getAdminDb()

  for (const entry of entries) {
    // Delete existing then insert
    await adminDb
      .from('grades')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', entry.student_id)
      .eq('category', category)
      .eq('title', title)

    await adminDb
      .from('grades')
      .insert({
        class_id: classId,
        student_id: entry.student_id,
        category,
        title,
        score: entry.score,
        max_score: entry.max_score,
        weight: 1.0,
      })
  }

  revalidatePath(`/teacher/classes/${classId}/grades`)
  return { success: true }
  } catch (err: unknown) {
    console.error('[bulkSaveGradesAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
