import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import nextDynamic from 'next/dynamic'
const LessonEditor = nextDynamic(() => import('@/components/teacher/lessons/LessonEditor'), {
  loading: () => (
    <div className="p-8 md:p-12 space-y-8 animate-pulse italic font-heading">
      <div className="h-10 w-64 bg-white/5 border border-white/10" />
      <div className="h-16 w-full bg-white/5 border border-white/10" />
      <div className="h-[600px] w-full bg-white/5 border border-white/10" />
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
    <div className="p-6 md:p-12 min-h-screen relative font-body text-slate-300 dark:bg-black selection:bg-primary/20 selection:text-primary overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10 italic">
        <Link href={`/teacher/classes/${lesson.class_id}/lessons`} className="inline-flex items-center text-[10px] font-heading font-black uppercase tracking-[0.3em] text-slate-600 hover:text-primary transition-all group mb-10">
            <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-2 transition-transform" /> TERMINATE_SESSION
        </Link>
        
        <div className="relative z-10">
          <LessonEditor initialLesson={lesson} />
        </div>
      </div>
    </div>
  )
}
