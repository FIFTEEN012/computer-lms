import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import nextDynamic from 'next/dynamic'
const LessonEditor = nextDynamic(() => import('@/components/teacher/lessons/LessonEditor'), {
  loading: () => (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-10 w-full bg-slate-800/30 rounded-sm" />
      <div className="h-[500px] w-full bg-slate-800/30 rounded-sm" />
    </div>
  ),
  ssr: false
})
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherLessonEditPage({ params }: { params: { lessonId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
     .from('lessons')
     .select('*')
     .eq('id', params.lessonId)
     .single()
     
  if (!lesson) redirect('/teacher/dashboard')

  // Security layer explicitly wrapping cross-references over Instructor bounds
  const { data: cls } = await supabase.from('classes').select('id').eq('id', lesson.class_id).eq('teacher_id', user.id).single()
  if (!cls) redirect('/teacher/dashboard')

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 selection:text-cyan-400">
      <Link href={`/teacher/classes/${lesson.class_id}/lessons`} className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors group mb-6">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> RETURN_TO_SEQUENCE
      </Link>
      
      <LessonEditor initialLesson={lesson} />
    </div>
  )
}
