import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClassTabs from '@/components/teacher/ClassTabs'
import QuizListClient from '@/components/teacher/quizzes/QuizListClient'

export const dynamic = 'force-dynamic'

export default async function TeacherQuizzesPage({ params }: { params: { classId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('id', params.classId)
    .single()

  if (!cls) redirect('/teacher/classes')

  // Fetch quizzes with embedded counts and attempt payloads
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select(`
      *,
      quiz_questions(count),
      quiz_attempts(score, max_score)
    `)
    .eq('class_id', params.classId)
    .order('created_at', { ascending: false })

  // Aggregate stats per quiz
  const enrichedQuizzes = (quizzes || []).map(q => {
    const questionsCount = q.quiz_questions?.[0]?.count || 0
    const attempts = q.quiz_attempts || []
    const attemptCount = attempts.length
    
    let avgScorePercent = 0
    if (attemptCount > 0) {
       const sumPercent = attempts.reduce((acc: number, a: any) => acc + (a.max_score > 0 ? (a.score / a.max_score) * 100 : 0), 0)
       avgScorePercent = Math.round(sumPercent / attemptCount)
    }

    return {
       ...q,
       questionsCount,
       attemptCount,
       avgScorePercent
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6">
        <QuizListClient classId={params.classId} initialQuizzes={enrichedQuizzes} />
      </div>
    </div>
  )
}
