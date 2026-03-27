import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentAttendanceClient from '@/components/student/attendance/StudentAttendanceClient'

export const dynamic = 'force-dynamic'

export default async function StudentAttendancePage({ params }: { params: { classId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cls } = await supabase
    .from('classes')
    .select('name, id')
    .eq('id', params.classId)
    .single()

  if (!cls) redirect('/student/dashboard')

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', params.classId)
    .eq('student_id', user.id)
    .order('date', { ascending: false })

  return (
    <StudentAttendanceClient
      classData={cls}
      attendance={attendance || []}
    />
  )
}
