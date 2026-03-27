import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import nextDynamic from 'next/dynamic'
const QuizBuilderClient = nextDynamic(() => import('@/components/teacher/quizzes/QuizBuilderClient'), {
  loading: () => (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-sm" />
      <div className="h-[400px] w-full bg-slate-800/30 rounded-sm" />
    </div>
  ),
  ssr: false
})

export const dynamic = 'force-dynamic'

export default async function TeacherQuizBuilderPage({ params }: { params: { quizId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch Quiz and verify Class Ownership implicitly by linking it backwards
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, classes!inner(id, name, teacher_id)')
    .eq('id', params.quizId)
    .single()

  if (!quiz || quiz.classes.teacher_id !== user.id) {
     redirect('/teacher/dashboard')
  }

  // Fetch Questions
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', params.quizId)
    .order('order_num', { ascending: true })

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-emerald-400/20 selection:text-emerald-400 overflow-x-hidden pb-32">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-emerald-500">M/Q</div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto space-y-6">
        
        <Link href={`/teacher/classes/${quiz.class_id}/quizzes`} className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> TERMINATE_CONSTRUCT
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
           <div>
              <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest bg-emerald-500/10 inline-block px-3 py-1 mb-3">
                 ASSESSMENT_CONSTRUCT_MODE
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase break-words">
                 BUILDER // <span className="text-emerald-400">&gt;_</span>
              </h1>
              <p className="font-mono text-xs text-slate-400 mt-4 max-w-xl">
                 Configuring active evaluation parameters for {quiz.classes.name}
              </p>
           </div>
        </div>

        <QuizBuilderClient quiz={quiz} initialQuestions={questions || []} classId={quiz.class_id} />
        
      </div>
    </div>
  )
}
