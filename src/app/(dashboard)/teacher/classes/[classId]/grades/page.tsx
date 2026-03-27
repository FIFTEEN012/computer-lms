import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GradeBookClient from '@/components/teacher/grades/GradeBookClient'

export const dynamic = 'force-dynamic'

export default async function TeacherGradeBookPage({ params }: { params: { classId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('id', params.classId)
    .eq('teacher_id', user.id)
    .single()
  if (!cls) redirect('/teacher/dashboard')

  // Get enrolled students
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id, profiles!inner(id, full_name, student_id)')
    .eq('class_id', params.classId)

  const students = (enrollments || []).map((e: any) => ({
    id: e.profiles.id,
    full_name: e.profiles.full_name,
    student_id: e.profiles.student_id,
  }))

  // Get all grades for this class
  const { data: grades } = await supabase
    .from('grades')
    .select('*')
    .eq('class_id', params.classId)

  // Get quiz attempts auto-pull
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, title')
    .eq('class_id', params.classId)

  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .in('quiz_id', (quizzes || []).map(q => q.id))
    .not('submitted_at', 'is', null)

  return (
    <GradeBookClient
      classData={cls}
      students={students}
      grades={grades || []}
      quizzes={quizzes || []}
      quizAttempts={quizAttempts || []}
    />
  )
}
