"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, RotateCcw, Home, Trophy, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function QuizResultDisplay({ quiz, attempt, questions, percentage, passed, passingScore, attemptsRemaining }: {
  quiz: any, attempt: any, questions: any[], percentage: number,
  passed: boolean, passingScore: number, attemptsRemaining: number
}) {
  const [displayPct, setDisplayPct] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const router = useRouter()

  // Animate score counter
  useEffect(() => {
    const duration = 1500
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayPct(Math.round(eased * percentage))
      if (progress < 1) requestAnimationFrame(animate)
    }
    const timeout = setTimeout(() => requestAnimationFrame(animate), 300)
    return () => clearTimeout(timeout)
  }, [percentage])

  const studentAnswers: Record<string, string> = attempt.answers || {}

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-body p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Score Card */}
        <div className={`relative overflow-hidden border-2 p-8 md:p-12 text-center ${passed ? 'border-emerald-400 bg-emerald-400/5' : 'border-red-400 bg-red-400/5'}`}>
          <div className={`absolute inset-x-0 top-0 h-1 ${passed ? 'bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'bg-red-400 shadow-[0_0_20px_rgba(248,113,113,0.8)]'}`} />
          
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-widest border mb-6 ${passed ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10' : 'border-red-400 text-red-400 bg-red-400/10'}`}>
            {passed ? <><CheckCircle2 className="w-4 h-4" /> ASSESSMENT_PASSED</> : <><XCircle className="w-4 h-4" /> ASSESSMENT_FAILED</>}
          </div>

          {/* Animated Score */}
          <div className={`text-7xl md:text-9xl font-black font-sans tabular-nums mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {displayPct}<span className="text-4xl md:text-5xl">%</span>
          </div>
          <div className="font-mono text-slate-500 text-sm uppercase tracking-widest mb-4">
            {attempt.score || 0} / {attempt.max_score || 0} points
          </div>

          {/* Score Bar */}
          <div className="max-w-sm mx-auto space-y-2 mb-8">
            <div className="h-2 w-full bg-slate-800 relative">
              {/* Passing threshold marker */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" style={{ left: `${passingScore}%` }} />
              <div className={`h-full transition-all duration-1000 ${passed ? 'bg-emerald-400' : 'bg-red-400'}`} style={{ width: `${displayPct}%` }} />
            </div>
            <div className="flex justify-between font-mono text-[9px] text-slate-600 uppercase tracking-widest">
              <span>0%</span>
              <span className="text-amber-400">Pass {passingScore}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* XP Banner */}
          {passed && (
            <div className="inline-flex items-center gap-3 bg-amber-400/10 border border-amber-400/50 px-6 py-3 mb-6">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-sm text-amber-400 font-bold uppercase tracking-widest">+20 XP EARNED</span>
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href={`/student/classes/${quiz.class_id}`} className="w-full sm:flex-1">
            <Button variant="ghost" className="w-full rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 h-12">
              <Home className="w-4 h-4 mr-2" /> RETURN_TO_CLASS
            </Button>
          </Link>
          
          {attemptsRemaining > 0 && (
            <Link href={`/student/quizzes/${quiz.id}`} className="w-full sm:flex-1">
              <Button className="w-full rounded-none font-mono text-[10px] uppercase tracking-widest border-2 border-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 h-12">
                <RotateCcw className="w-4 h-4 mr-2" /> RETRY ({attemptsRemaining} left)
              </Button>
            </Link>
          )}
          
          <Button onClick={() => setShowReview(r => !r)} variant="ghost"
            className="w-full sm:w-auto rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 h-12 sm:px-6">
            {showReview ? 'HIDE' : 'REVIEW'} ANSWERS
          </Button>
        </div>

        {/* Answer Review */}
        {showReview && (
          <div className="space-y-4">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-500">ANSWER_REVIEW_MATRIX</h2>
            {questions.map((q, idx) => {
              const studentAns = studentAnswers[q.id]
              const isCorrect = studentAns?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()

              const getDisplayAnswer = (val: string | undefined, qType: string, opts: string[]) => {
                if (!val) return '(no answer)'
                if (qType === 'multiple_choice') {
                  const optIdx = parseInt(val)
                  return !isNaN(optIdx) && opts?.[optIdx] ? opts[optIdx] : val
                }
                return val
              }

              return (
                <div key={q.id} className={`border ${isCorrect ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5'} p-5`}>
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />}
                    <p className="font-sans text-sm text-white font-medium">Q{idx + 1}: {q.question}</p>
                  </div>
                  <div className="ml-7 space-y-2 font-mono text-[11px]">
                    <div className={`${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      Your answer: {getDisplayAnswer(studentAns, q.question_type, q.options)}
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-400">
                        Correct: {getDisplayAnswer(q.correct_answer, q.question_type, q.options)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
