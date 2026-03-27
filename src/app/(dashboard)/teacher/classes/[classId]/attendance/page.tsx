import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AttendanceTrackerClient from '@/components/teacher/attendance/AttendanceTrackerClient'

export const dynamic = 'force-dynamic'

export default async function TeacherAttendancePage({ params }: { params: { classId: string } }) {
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
    .select('student_id, profiles!inner(id, full_name, student_id, avatar_url)')
    .eq('class_id', params.classId)

  const students = (enrollments || []).map((e: any) => ({
    id: e.profiles.id,
    full_name: e.profiles.full_name,
    student_id: e.profiles.student_id,
    avatar_url: e.profiles.avatar_url,
  }))

  // Get all attendance for this class
  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', params.classId)
    .order('date', { ascending: false })

  return (
    <AttendanceTrackerClient
      classData={cls}
      students={students}
      allAttendance={allAttendance || []}
    />
  )
}
