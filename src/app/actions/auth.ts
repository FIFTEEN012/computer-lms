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
    console.log('[signInAction] Attempting login for:', email)
    
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.warn('[signInAction] Supabase Auth Error:', error.message)
      return { error: error.message }
    }

    if (!data.user) {
      console.error('[signInAction] Login succeeded but user object missing')
      return { error: 'AUTHENTICATION_ANOMALY: User missing' }
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()

    console.log('[signInAction] Authentication successful for:', email, 'Role:', profile?.role)
    return { success: true, redirectUrl: profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard' }
  } catch (err: any) {
    console.error('[signInAction] Fatal Error:', err)
    if (err.message && err.message.includes('fetch')) {
      return { error: `NETWORK_ERROR: The server failed to reach the database (Supabase). Please verify NEXT_PUBLIC_SUPABASE_URL is correct.` }
    }
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
