import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getStudentQuizAction } from '@/app/actions/quiz'
import StudentQuizTaker from '@/components/student/quizzes/StudentQuizTaker'

export const dynamic = 'force-dynamic'

export default async function StudentTakeQuizPage({ params }: { params: { quizId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const result = await getStudentQuizAction(params.quizId)

  if (result?.error === 'MAX_ATTEMPTS_EXCEEDED') {
    redirect(`/student/quizzes/${params.quizId}/result`)
  }

  if (result?.error || !result?.quiz || !result?.questions || !result?.attemptId) {
    redirect('/student/dashboard')
  }

  return (
    <StudentQuizTaker
      quiz={result.quiz}
      questions={result.questions as any[]}
      attemptId={result.attemptId as string}
    />
  )
}
