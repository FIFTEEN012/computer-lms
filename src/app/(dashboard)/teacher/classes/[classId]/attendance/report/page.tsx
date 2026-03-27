import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AttendanceReportClient from '@/components/teacher/attendance/AttendanceReportClient'

export const dynamic = 'force-dynamic'

export default async function TeacherAttendanceReportPage({ params }: { params: { classId: string } }) {
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
    .select('student_id, profiles!inner(id, full_name, student_id)')
    .eq('class_id', params.classId)

  const students = (enrollments || []).map((e: any) => ({
    id: e.profiles.id,
    full_name: e.profiles.full_name,
    student_id: e.profiles.student_id,
  }))

  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', params.classId)
    .order('date', { ascending: false })

  return (
    <AttendanceReportClient
      classData={cls}
      students={students}
      allAttendance={allAttendance || []}
    />
  )
}
