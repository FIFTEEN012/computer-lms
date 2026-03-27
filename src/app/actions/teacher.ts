"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const classSchema = z.object({
  name: z.string().min(3, "Class name must be at least 3 characters"),
  description: z.string().optional(),
  academic_year: z.string().min(4, "e.g., 2024-2025"),
  semester: z.coerce.number().min(1).max(3),
  class_code: z.string().min(4, "Code must be at least 4 characters").toUpperCase(),
})

export async function createClassAction(formData: FormData | z.infer<typeof classSchema>) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized - Session Expired" }

  const parsedData = formData instanceof FormData 
    ? Object.fromEntries(formData.entries()) 
    : formData

  const result = classSchema.safeParse(parsedData)
  
  if (!result.success) {
    return { error: "Invalid formulation. Please check your inputs.", details: result.error.issues }
  }

  const { error } = await supabase.from('classes').insert({
    ...result.data,
    teacher_id: user.id
  })

  if (error) {
    if (error.code === '23505') return { error: "Class code already exists. Please choose a unique code." }
    return { error: error.message }
  }

  revalidatePath('/teacher/classes')
  revalidatePath('/teacher/dashboard')
  return { success: true }
  } catch (err: unknown) {
    console.error('[createClassAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function deleteClassAction(classId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  
  if (error) return { error: error.message }

  revalidatePath('/teacher/classes')
  revalidatePath('/teacher/dashboard')
  return { success: true }
}

export async function addStudentByEmailAction(classId: string, email: string) {
  try {
  const supabase = createClient()
  
  // 1. Locate student
  const { data: student, error: fetchError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .single()

  if (fetchError || !student) return { error: "Student profile not found within LMS network." }
  if (student.role !== 'student') return { error: "Target identity is not registered as a Student Node." }

  // 2. Prevent duplication hook
  const { data: existing } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', student.id)
    .single()

  if (existing) return { error: "Student is already enrolled in this local cluster." }

  // 3. Inject enrollment 
  const { error } = await supabase.from('class_enrollments').insert({
    class_id: classId,
    student_id: student.id
  })

  if (error) return { error: error.message }

  revalidatePath(`/teacher/classes/${classId}`)
  revalidatePath('/teacher/classes')
  return { success: true }
  } catch (err: unknown) {
    console.error('[addStudentByEmailAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function removeStudentAction(classId: string, studentId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', studentId)

  if (error) return { error: error.message }

  revalidatePath(`/teacher/classes/${classId}`)
  revalidatePath('/teacher/dashboard')
  return { success: true }
}

export async function bulkImportStudentsAction(classId: string, emails: string[]) {
  const supabase = createClient()
  let added = 0
  let failed = 0
  
  for (const email of emails) {
    if (!email || email.trim() === '') continue;
    const res = await addStudentByEmailAction(classId, email.trim())
    if (res.success) added++
    else failed++
  }

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true, added, failed }
}
