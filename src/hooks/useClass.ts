"use client"

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Class = Database['public']['Tables']['classes']['Row']

export function useClass() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchTeacherClasses = useCallback(async (teacherId: string) => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      
    if (error) {
      setError(error as any)
    } else if (data) {
      setClasses(data)
    }
    
    setLoading(false)
  }, [supabase])

  return { classes, loading, error, fetchTeacherClasses }
}
