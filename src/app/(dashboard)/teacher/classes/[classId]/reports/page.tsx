import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import nextDynamic from 'next/dynamic'
const ClassReportsClient = nextDynamic(() => import('@/components/teacher/reports/ClassReportsClient'), {
  loading: () => (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-sm" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800/30 rounded-sm" />)}
      </div>
      <div className="h-[300px] w-full bg-slate-800/30 rounded-sm" />
    </div>
  ),
  ssr: false
})

export const dynamic = 'force-dynamic'

export default async function TeacherClassReportsPage({ params }: { params: { classId: string } }) {
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

  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id, profiles!inner(id, full_name, student_id, xp_total)')
    .eq('class_id', params.classId)

  const students = (enrollments || []).map((e: any) => ({
    id: e.profiles.id,
    full_name: e.profiles.full_name,
    student_id: e.profiles.student_id,
    xp_total: e.profiles.xp_total || 0,
  }))

  const { data: grades } = await supabase.from('grades').select('*').eq('class_id', params.classId)
  const { data: attendance } = await supabase.from('attendance').select('*').eq('class_id', params.classId)
  const { data: quizzes } = await supabase.from('quizzes').select('id, title').eq('class_id', params.classId)
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .in('quiz_id', (quizzes || []).map(q => q.id))
    .not('submitted_at', 'is', null)

  return (
    <ClassReportsClient
      classData={cls}
      students={students}
      grades={grades || []}
      attendance={attendance || []}
      quizAttempts={quizAttempts || []}
    />
  )
}
