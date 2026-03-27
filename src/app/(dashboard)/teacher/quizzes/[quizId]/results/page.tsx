import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Users, Target, TrendingUp, AlertTriangle } from 'lucide-react'
import QuizResultsClient from '@/components/teacher/quizzes/QuizResultsClient'

export const dynamic = 'force-dynamic'

export default async function TeacherQuizResultsPage({ params }: { params: { quizId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, classes!inner(id, name, teacher_id)')
    .eq('id', params.quizId)
    .single()

  if (!quiz || quiz.classes.teacher_id !== user.id) redirect('/teacher/dashboard')

  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', params.quizId)
    .order('order_num')

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('*, profiles!inner(full_name, email, student_id)')
    .eq('quiz_id', params.quizId)
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: false })

  const passingScore = quiz.passing_score || 60

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-emerald-400/20 selection:text-emerald-400 overflow-x-hidden">
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-emerald-500">A/X</div>
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6">
        <Link href={`/teacher/classes/${quiz.class_id}/quizzes`} className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> BACK_TO_QUIZZES
        </Link>
        <div className="bg-[#1c1b1b] border-l-4 border-emerald-500 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest mb-2">ANALYTICS_MATRIX</div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">{quiz.title}</h1>
            <p className="text-slate-500 font-mono text-[10px] mt-1 uppercase tracking-widest">{quiz.classes.name}</p>
          </div>
        </div>
        <QuizResultsClient
          quiz={quiz}
          questions={questions || []}
          attempts={attempts || []}
          passingScore={passingScore}
        />
      </div>
    </div>
  )
}
