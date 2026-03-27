import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient as createAdmin } from '@supabase/supabase-js'
import QuizResultDisplay from '@/components/student/quizzes/QuizResultDisplay'

export const dynamic = 'force-dynamic'

export default async function StudentQuizResultPage({ params, searchParams }: {
  params: { quizId: string }, searchParams: { attemptId?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, classes(id, name)')
    .eq('id', params.quizId)
    .single()

  if (!quiz) redirect('/student/dashboard')

  // Fetch attempt(s) for this student
  let attempt = null
  if (searchParams.attemptId) {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', searchParams.attemptId)
      .eq('student_id', user.id)
      .single()
    attempt = data
  } else {
    const { data } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', params.quizId)
      .eq('student_id', user.id)
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()
    attempt = data
  }

  if (!attempt) redirect(`/student/classes/${quiz.class_id}`)

  // Fetch questions with answers (secure admin read) for the review
  const { data: questions } = await adminDb
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', params.quizId)
    .order('order_num')

  const passingScore = quiz.passing_score || 60
  const percentage = attempt.max_score > 0 ? Math.round((attempt.score / attempt.max_score) * 100) : 0
  const passed = percentage >= passingScore

  // Check remaining attempts
  const { data: allAttempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', params.quizId)
    .eq('student_id', user.id)
    .not('submitted_at', 'is', null)

  const attemptsUsed = allAttempts?.length || 0
  const attemptsRemaining = Math.max(0, (quiz.max_attempts || 1) - attemptsUsed)

  return (
    <QuizResultDisplay
      quiz={quiz}
      attempt={attempt}
      questions={questions || []}
      percentage={percentage}
      passed={passed}
      passingScore={passingScore}
      attemptsRemaining={attemptsRemaining}
    />
  )
}
