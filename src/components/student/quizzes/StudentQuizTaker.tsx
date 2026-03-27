"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuizAction } from '@/app/actions/quiz'
import { Button } from '@/components/ui/button'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckSquare, AlertTriangle, Loader2 } from 'lucide-react'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function StudentQuizTaker({ quiz, questions, attemptId }: {
  quiz: any, questions: any[], attemptId: string
}) {
  const router = useRouter()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(() => quiz.time_limit_minutes ? quiz.time_limit_minutes * 60 : null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setShowConfirm(false)
    const res = await submitQuizAction(quiz.id, attemptId, answers)
    if (res?.success) {
      router.push(`/student/quizzes/${quiz.id}/result?attemptId=${attemptId}`)
    } else {
      setSubmitting(false)
    }
  }, [quiz.id, attemptId, answers, router])

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { handleSubmit(); return }
    const interval = setInterval(() => setTimeLeft(t => (t !== null ? t - 1 : null)), 1000)
    return () => clearInterval(interval)
  }, [timeLeft, handleSubmit])

  const currentQ = questions[currentIdx]
  const isTimeCritical = timeLeft !== null && timeLeft < 60

  const selectAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
  }

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev)
      if (next.has(currentQ.id)) next.delete(currentQ.id)
      else next.add(currentQ.id)
      return next
    })
  }

  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-body flex flex-col overflow-hidden">
      
      {/* Confirm Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#131313] border border-amber-500/50 shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-amber-500" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <h3 className="font-sans font-black text-white uppercase tracking-tight">SUBMIT_ASSESSMENT?</h3>
              </div>
              <p className="font-mono text-[11px] text-slate-400 leading-relaxed">
                You have answered <span className="text-white font-bold">{answeredCount}</span> of <span className="text-white font-bold">{questions.length}</span> questions.
                {answeredCount < questions.length && <span className="text-amber-400"> {questions.length - answeredCount} unanswered.</span>}
                {' '}This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowConfirm(false)} variant="ghost" className="flex-1 rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800">CANCEL</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-none font-mono text-[10px] uppercase tracking-widest bg-amber-500 hover:bg-amber-400 text-black">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONFIRM_SUBMIT'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-[#131313] px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-sans font-black text-sm text-white uppercase truncate">{quiz.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-1 flex-1 max-w-xs bg-slate-800">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="font-mono text-[9px] text-slate-500 uppercase whitespace-nowrap">{answeredCount}/{questions.length} answered</span>
          </div>
        </div>

        {timeLeft !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 border font-mono text-sm font-bold transition-colors ${isTimeCritical ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' : 'border-slate-800 bg-[#1a1a1a] text-white'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        )}

        <Button onClick={() => setShowConfirm(true)} disabled={submitting}
          className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black h-9 px-4">
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'SUBMIT'}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Map Sidebar */}
        <aside className="hidden md:flex flex-col flex-shrink-0 w-56 border-r border-slate-800 bg-[#131313] overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-800">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Question Map</span>
          </div>
          <div className="p-3 grid grid-cols-4 gap-1.5">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id]
              const isFlagged = flagged.has(q.id)
              const isCurrent = i === currentIdx
              return (
                <button key={q.id} onClick={() => setCurrentIdx(i)}
                  className={`h-9 w-full font-mono text-xs font-bold border transition-colors ${
                    isCurrent ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' :
                    isFlagged ? 'border-amber-400/50 bg-amber-400/10 text-amber-400' :
                    isAnswered ? 'border-slate-600 bg-slate-800 text-white' :
                    'border-slate-800 bg-transparent text-slate-600 hover:border-slate-600'
                  }`}
                >{i + 1}</button>
              )
            })}
          </div>
          <div className="p-3 border-t border-slate-800 space-y-2 mt-auto">
            {[
              ['border-emerald-400 bg-emerald-400/10', 'Current'],
              ['border-slate-600 bg-slate-800', 'Answered'],
              ['border-amber-400/50 bg-amber-400/10', 'Flagged'],
              ['border-slate-800', 'Unanswered'],
            ].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 border ${cls}`} />
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto">
          {currentQ && (
            <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
              
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 border border-slate-800 px-2 py-1">
                      Q{currentIdx + 1} / {questions.length}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border ${
                      currentQ.question_type === 'multiple_choice' ? 'border-cyan-400/30 text-cyan-400' :
                      currentQ.question_type === 'true_false' ? 'border-fuchsia-400/30 text-fuchsia-400' :
                      'border-amber-400/30 text-amber-400'
                    }`}>{currentQ.question_type.replace('_', ' ')}</span>
                    <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest ml-auto">{currentQ.points || 1} pts</span>
                  </div>
                  <h2 className="font-sans text-xl md:text-2xl font-bold text-white leading-relaxed">{currentQ.question}</h2>
                </div>
                <button onClick={toggleFlag} title="Flag for review"
                  className={`flex-shrink-0 p-2 border transition-colors ${flagged.has(currentQ.id) ? 'border-amber-400 text-amber-400 bg-amber-400/10' : 'border-slate-800 text-slate-600 hover:border-amber-400 hover:text-amber-400'}`}>
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Answer Area */}
              <div className="space-y-3">
                {currentQ.question_type === 'multiple_choice' && (
                  (currentQ.options || []).map((opt: string, oi: number) => (
                    <button key={oi} onClick={() => selectAnswer(String(oi))}
                      className={`w-full text-left p-4 border-2 transition-all font-sans text-sm flex items-center gap-4 ${
                        answers[currentQ.id] === String(oi)
                          ? 'border-emerald-400 bg-emerald-400/10 text-white'
                          : 'border-slate-800 bg-[#131313] text-slate-300 hover:border-slate-600 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center border-2 font-mono font-black text-xs ${
                        answers[currentQ.id] === String(oi) ? 'border-emerald-400 bg-emerald-400 text-black' : 'border-slate-700 text-slate-500'
                      }`}>{String.fromCharCode(65 + oi)}</span>
                      {opt}
                    </button>
                  ))
                )}

                {currentQ.question_type === 'true_false' && (
                  <div className="flex gap-4">
                    {[['true', '✓ TRUE'], ['false', '✗ FALSE']].map(([val, label]) => (
                      <button key={val} onClick={() => selectAnswer(val)}
                        className={`flex-1 py-6 font-mono font-black text-sm uppercase tracking-widest border-2 transition-all ${
                          answers[currentQ.id] === val
                            ? val === 'true' ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-red-400 bg-red-400/10 text-red-400'
                            : 'border-slate-800 bg-[#131313] text-slate-500 hover:border-slate-600'
                        }`}
                      >{label}</button>
                    ))}
                  </div>
                )}

                {currentQ.question_type === 'short_answer' && (
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={e => selectAnswer(e.target.value)}
                    rows={4}
                    className="w-full bg-[#131313] border-2 border-slate-800 focus:border-emerald-400 px-4 py-3 text-white font-sans text-sm resize-none outline-none transition-colors placeholder:text-slate-700"
                    placeholder="Enter your answer here..."
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Nav */}
      <div className="flex-shrink-0 border-t border-slate-800 bg-[#131313] px-4 py-3 flex items-center justify-between">
        <Button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
          variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 h-9">
          <ChevronLeft className="w-4 h-4 mr-1" /> PREV
        </Button>
        
        <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest hidden sm:block">
          {answers[currentQ?.id] ? '✓ Answered' : 'Not answered'}
        </span>

        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
            className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-slate-800 hover:bg-slate-700 text-white h-9 border border-slate-700">
            NEXT <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={() => setShowConfirm(true)} disabled={submitting}
            className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black h-9 border-2 border-emerald-400">
            FINALIZE_SUBMISSION
          </Button>
        )}
      </div>
    </div>
  )
}
