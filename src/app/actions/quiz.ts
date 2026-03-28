"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// We use the Service Role explicitly for bypassing RLS to fetch questions securely without leaking them to the public anon/auth endpoint
function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createQuizAction(classId: string, title: string, timeLimitMinutes: number | null, maxAttempts: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: cls } = await supabase.from('classes').select('id').eq('id', classId).eq('teacher_id', user.id).single()
  if (!cls) return { error: "Permission denied" }

  const { data, error } = await supabase.from('quizzes').insert({
    class_id: classId,
    title,
    time_limit_minutes: timeLimitMinutes,
    max_attempts: maxAttempts,
    is_published: false
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath(`/teacher/classes/${classId}/quizzes`)
  return { success: true, quiz: data }
}

export async function updateQuizAction(quizId: string, classId: string, data: any) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from('quizzes').update(data).eq('id', quizId).eq('class_id', classId)
  if (error) return { error: error.message }
  
  revalidatePath(`/teacher/quizzes/${quizId}/edit`)
  revalidatePath(`/teacher/classes/${classId}/quizzes`)
  return { success: true }
}

export async function deleteQuizAction(quizId: string, classId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from('quizzes').delete().eq('id', quizId).eq('class_id', classId)
  if (error) return { error: error.message }

  revalidatePath(`/teacher/classes/${classId}/quizzes`)
  return { success: true }
}

// Teacher Bulk Overwrites Questions using a transaction-like replacement
export async function updateQuizQuestionsAction(quizId: string, questions: any[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error: delError } = await supabase.from('quiz_questions').delete().eq('quiz_id', quizId)
  if (delError) return { error: delError.message }

  const formattedQuestions = questions.map((q, idx) => ({
    quiz_id: quizId,
    question: q.question,
    question_type: q.question_type,
    options: q.options || null,
    correct_answer: q.correct_answer,
    points: q.points || 1,
    order_num: idx + 1
  }))

  if (formattedQuestions.length > 0) {
     const { error: insError } = await supabase.from('quiz_questions').insert(formattedQuestions)
     if (insError) return { error: insError.message }
  }

  revalidatePath(`/teacher/quizzes/${quizId}/edit`)
  return { success: true }
}

// STUDENT FLOW ACTIONS
export async function getStudentQuizAction(quizId: string) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Verify Quiz is published
  const { data: quiz, error: quizErr } = await supabase.from('quizzes').select('*').eq('id', quizId).eq('is_published', true).single()
  if (quizErr || !quiz) return { error: "Assessment offline or does not exist." }

  // 2. Fetch Attempts
  const { data: attempts } = await supabase.from('quiz_attempts').select('id, score, max_score, submitted_at').eq('quiz_id', quizId).eq('student_id', user.id)
  
  if (attempts && attempts.length >= (quiz.max_attempts || 1)) {
     return { error: "MAX_ATTEMPTS_EXCEEDED" }
  }

  // 3. SECURE FETCH: Bypass RLS using Admin Client to get questions, then strip answers before sending to browser
  const adminDb = getAdminSupabase()
  const { data: questions } = await adminDb.from('quiz_questions').select('*').eq('quiz_id', quizId).order('order_num')
  
  if (!questions) return { error: "CORRUPTED_ASSESSMENT: No questions found." }

  const sanitizedQuestions = questions.map(q => {
     // Explicitly delete correct_answer to prevent client side cheating
     const { correct_answer, ...safeQ } = q
     return safeQ
  })

  // Log active attempt start time
  const { data: newAttempt, error: attError } = await supabase.from('quiz_attempts').insert({
     quiz_id: quizId,
     student_id: user.id,
     started_at: new Date().toISOString()
  }).select('id').single()

  if (attError) return { error: attError.message }

  return { success: true, quiz, questions: sanitizedQuestions, attemptId: newAttempt.id }
  } catch (err: unknown) {
    console.error('[getStudentQuizAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

export async function submitQuizAction(quizId: string, attemptId: string, studentAnswers: Record<string, string>) {
  try {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const adminDb = getAdminSupabase()
  
  // 1. Fetch exact verified questions
  const { data: questions } = await adminDb.from('quiz_questions').select('id, correct_answer, points, question_type').eq('quiz_id', quizId)
  if (!questions) return { error: "Database mapping failure." }

  let earnedScore = 0
  let maxScore = 0

  // 2. Auto Grade
  for (const q of questions) {
     const qPoints = q.points || 1
     maxScore += qPoints
     const givenAns = studentAnswers[q.id]
     
     if (givenAns && givenAns.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()) {
        earnedScore += qPoints
     }
  }

  const passThreshold = 0.6 // 60% passing mark
  const percentage = maxScore > 0 ? (earnedScore / maxScore) : 0
  const passed = percentage >= passThreshold
  const isPerfect = percentage >= 1.0

  // 3. Fetch attempt start time for speed check
  const { data: attemptData } = await supabase
    .from('quiz_attempts')
    .select('started_at')
    .eq('id', attemptId)
    .single()

  // 4. Commit Attempt
  const submittedAt = new Date().toISOString()
  await supabase.from('quiz_attempts').update({
     answers: studentAnswers,
     score: earnedScore,
     max_score: maxScore,
     submitted_at: submittedAt
  }).eq('id', attemptId).eq('student_id', user.id)

  // 5. XP Awards via gamification system
  const { awardXP, checkAndAwardBadges } = await import('./gamification')
  let totalXP = 0
  let oldXP = 0
  let newXP = 0

  if (passed) {
    const result = await awardXP(user.id, 20, 'Quiz Passed', quizId)
    oldXP = result.oldXP
    newXP = result.newXP
    totalXP += 20
  }

  if (isPerfect) {
    const result = await awardXP(user.id, 50, 'Perfect Quiz Score', quizId)
    if (oldXP === 0) oldXP = result.oldXP
    newXP = result.newXP
    totalXP += 50
  }

  // Speed bonus: completed in under 5 minutes
  if (attemptData?.started_at) {
    const duration = (new Date(submittedAt).getTime() - new Date(attemptData.started_at).getTime()) / 60000
    if (duration < 5 && duration > 0) {
      const result = await awardXP(user.id, 5, 'Speed Quiz (<5min)', quizId)
      if (oldXP === 0) oldXP = result.oldXP
      newXP = result.newXP
      totalXP += 5
    }
  }

  // 6. Check badges
  const badgesAwarded = totalXP > 0 ? await checkAndAwardBadges(user.id) : []

  // 7. Update daily streak
  const { checkAndUpdateStreak } = await import('@/lib/streak')
  const streakResult = await checkAndUpdateStreak(user.id, 'quiz', totalXP)

  revalidatePath(`/student/quizzes/${quizId}/result`)
  revalidatePath(`/student/leaderboard`)
  return { success: true, earnedScore, maxScore, passed, isPerfect, xpGained: totalXP, oldXP, newXP, badgesAwarded, streak: streakResult }
  } catch (err: unknown) {
    console.error('[submitQuizAction]', err)
    return { error: `SYSTEM_ERROR: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

