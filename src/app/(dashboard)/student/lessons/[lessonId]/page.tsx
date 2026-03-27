import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import StudentLessonReader from '@/components/student/lessons/StudentLessonReader'

export const dynamic = 'force-dynamic'

export default async function StudentLessonViewPage({ params }: { params: { lessonId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
     .from('lessons')
     .select('*')
     .eq('id', params.lessonId)
     .eq('is_published', true)
     .single()
     
  if (!lesson) redirect('/student/dashboard')

  // Verify explicit enrollment preventing rogue parameter URL jumps
  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('class_id', lesson.class_id)
    .single()

  if (!enrollment) redirect('/student/classes')

  // Check if completed natively
  const { data: progress } = await supabase.from('lesson_progress').select('completed_at').eq('lesson_id', lesson.id).eq('student_id', user.id).single()
  const isCompleted = !!progress?.completed_at

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 selection:text-cyan-400 bg-gradient-to-b from-transparent to-[#0a0a0a]">
      <div className="max-w-3xl mx-auto mb-8">
         <Link href={`/student/classes/${lesson.class_id}`} className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors group mb-6">
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> TERMINATE_STREAM
         </Link>
         
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
               <div className="font-mono text-[10px] text-fuchsia-400 uppercase tracking-widest bg-fuchsia-400/10 inline-block px-3 py-1 mb-3">
                 ACTIVE_STREAM_PROTOCOL
               </div>
               <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase break-words">
                 {lesson.title}
               </h1>
               {lesson.description && (
                  <p className="font-mono text-xs text-slate-400 mt-4 max-w-xl">
                     {lesson.description}
                  </p>
               )}
            </div>
            
            <div className="flex items-center text-slate-500 font-mono text-[10px] uppercase tracking-widest border border-slate-800 bg-[#1c1b1b] px-4 py-2 mt-4 md:mt-0">
               <Clock className="w-3 h-3 mr-2 text-cyan-400" />
               EST: {lesson.time_estimated_minutes || 0}_MIN
            </div>
         </div>
      </div>
      
      <StudentLessonReader lesson={lesson} classId={lesson.class_id} isCompleted={isCompleted} />
    </div>
  )
}
