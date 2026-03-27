"use server"

import { loginSchema, registerSchema } from '@/lib/validations'
import { z } from 'zod'

export async function signInAction(formData: z.infer<typeof loginSchema>) {
  const result = loginSchema.safeParse(formData)
  
  if (!result.success) {
    return { error: 'Invalid input fields' }
  }
  try {

  const { email, password } = result.data
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()

  return { success: true, redirectUrl: profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard' }
  } catch (err: unknown) {
    console.error('[signInAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function signUpAction(formData: z.infer<typeof registerSchema>) {
  const result = registerSchema.safeParse(formData)
  
  if (!result.success) {
    return { error: 'Invalid formulation. Please check your inputs.', details: result.error.issues }
  }
  try {

  const { email, password, fullName, role, studentId } = result.data
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
        student_id: studentId || null,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
  } catch (err: unknown) {
    console.error('[signUpAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function signOutAction() {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  await supabase.auth.signOut()
}
