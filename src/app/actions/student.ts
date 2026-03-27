"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function joinClassAction(classCode: string) {
  try {
  if (!classCode || classCode.trim() === '') return { error: "Authorization code missing." }
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication timeout. Please re-authenticate." }

  // Execute hash lookup against Active Class Nodes
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('id')
    .eq('class_code', classCode.trim().toUpperCase())
    .single()

  if (clsError || !cls) return { error: "ACCESS_DENIED: Invalid or expired access code." }

  // Prevent double enrollment duplication
  const { data: existing } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('class_id', cls.id)
    .eq('student_id', user.id)
    .single()

  if (existing) return { error: "Warning: Profile already bound to this specific Node." }

  // Commit insertion
  const { error } = await supabase.from('class_enrollments').insert({
    class_id: cls.id,
    student_id: user.id
  })

  if (error) return { error: "DATABASE_ERROR: " + error.message }

  // Purge standard sub-tree caches manually forcing fresh component fetching overhead
  revalidatePath('/student/classes')
  revalidatePath('/student/dashboard')
  
  return { success: true, classId: cls.id }
  } catch (err: unknown) {
    console.error('[joinClassAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function leaveClassAction(classId: string) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication timeout. Please re-authenticate." }

  const { error } = await supabase
    .from('class_enrollments')
    .delete()
    .eq('class_id', classId)
    .eq('student_id', user.id)

  if (error) return { error: 'SEVERANCE_FAILED: ' + error.message }

  revalidatePath('/student/classes')
  revalidatePath('/student/dashboard')
  
  return { success: true }
  } catch (err: unknown) {
    console.error('[leaveClassAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function updateProfileAction(formData: FormData) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Authentication timeout." }

  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  // Note: Avatar storage uploading implies creating a Supabase Storage bucket.
  // For simplicity we handle basic Profile credentials and Passwords.
  
  if (fullName && fullName.trim() !== '') {
    const { error } = await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id)
    if (error) return { error: "PROFILE_UPDATE_FAILED: " + error.message }
  }

  if (password && password.trim() !== '') {
     const { error } = await supabase.auth.updateUser({ password: password.trim() })
     if (error) return { error: "SECURITY_UPDATE_FAILED: " + error.message }
  }
  
  revalidatePath('/student/profile')
  revalidatePath('/student/dashboard')
  return { success: true }
  } catch (err: unknown) {
    console.error('[updateProfileAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}
