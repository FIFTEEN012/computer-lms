import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GRADE_WEIGHTS, calculateWeightedScore, getGradeLetter, getGradeColor } from '@/lib/utils/grades'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CATEGORIES = Object.keys(GRADE_WEIGHTS)

export default async function StudentGradesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get enrolled classes
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes!inner(id, name)')
    .eq('student_id', user.id)

  const classIds = (enrollments || []).map((e: any) => e.class_id)

  // My grades
  const { data: myGrades } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', user.id)

  // All grades for comparison (anonymous avg)
  const { data: allGrades } = await supabase
    .from('grades')
    .select('*')
    .in('class_id', classIds)

  // My quiz attempts
  const { data: quizzes } = await supabase.from('quizzes').select('id, class_id').in('class_id', classIds)
  const { data: myAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('student_id', user.id)
    .not('submitted_at', 'is', null)

  // All quiz attempts for avg
  const { data: allAttempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .in('quiz_id', (quizzes || []).map(q => q.id))
    .not('submitted_at', 'is', null)

  // Build per-class grade cards
  const classCards = (enrollments || []).map((enrollment: any) => {
    const classId = enrollment.class_id
    const className = enrollment.classes.name

    // My scores
    const classGrades = (myGrades || []).filter(g => g.class_id === classId)
    const classQuizIds = (quizzes || []).filter(q => q.class_id === classId).map(q => q.id)
    const classQuizAttempts = (myAttempts || []).filter(a => classQuizIds.includes(a.quiz_id))

    const myByCategory: Record<string, { score: number; maxScore: number }[]> = {}
    CATEGORIES.forEach(cat => {
      if (cat === 'Quizzes') {
        const byQuiz: Record<string, any> = {}
        classQuizAttempts.forEach(a => {
          if (!byQuiz[a.quiz_id] || (a.score || 0) > (byQuiz[a.quiz_id].score || 0)) byQuiz[a.quiz_id] = a
        })
        myByCategory[cat] = Object.values(byQuiz).map(a => ({ score: a.score || 0, maxScore: a.max_score || 0 }))
      } else {
        myByCategory[cat] = classGrades
          .filter(g => g.category === cat)
          .map(g => ({ score: g.score || 0, maxScore: g.max_score || 0 }))
      }
    })

    const { weighted: myWeighted, breakdown: myBreakdown } = calculateWeightedScore(myByCategory)

    // Class averages (anonymous)
    const allClassGrades = (allGrades || []).filter(g => g.class_id === classId)
    const allClassAttempts = (allAttempts || []).filter(a => classQuizIds.includes(a.quiz_id))

    // Get distinct students
    const studentIds = new Set([
      ...allClassGrades.map(g => g.student_id),
      ...allClassAttempts.map(a => a.student_id),
    ])

    let totalWeighted = 0
    let count = 0
    studentIds.forEach(sid => {
      const sGrades = allClassGrades.filter(g => g.student_id === sid)
      const sAttempts = allClassAttempts.filter(a => a.student_id === sid)
      const sByCategory: Record<string, { score: number; maxScore: number }[]> = {}
      CATEGORIES.forEach(cat => {
        if (cat === 'Quizzes') {
          const byQuiz: Record<string, any> = {}
          sAttempts.forEach(a => {
            if (!byQuiz[a.quiz_id] || (a.score || 0) > (byQuiz[a.quiz_id].score || 0)) byQuiz[a.quiz_id] = a
          })
          sByCategory[cat] = Object.values(byQuiz).map(a => ({ score: a.score || 0, maxScore: a.max_score || 0 }))
        } else {
          sByCategory[cat] = sGrades.filter(g => g.category === cat).map(g => ({ score: g.score || 0, maxScore: g.max_score || 0 }))
        }
      })
      const { weighted } = calculateWeightedScore(sByCategory)
      if (weighted > 0) { totalWeighted += weighted; count++ }
    })

    const classAvg = count > 0 ? Math.round(totalWeighted / count) : 0

    return { classId, className, myWeighted, myBreakdown, myLetter: getGradeLetter(myWeighted), classAvg }
  })

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 overflow-x-hidden">
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-cyan-500">M/G</div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
        <Link href="/student/dashboard" className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> DASHBOARD
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-400/10 inline-block px-3 py-1 mb-3">MY_GRADES</div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">Performance Matrix</h1>
        </div>

        {classCards.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-800 bg-[#131313]">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">NO_CLASSES_ENROLLED</p>
          </div>
        ) : (
          <div className="space-y-6">
            {classCards.map(card => {
              const diff = card.myWeighted - card.classAvg
              return (
                <div key={card.classId} className="bg-[#131313] border border-slate-800">
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-sans font-black text-sm text-white uppercase">{card.className}</h3>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-2xl font-black px-3 py-1 border ${card.myWeighted >= 70 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : card.myWeighted >= 50 ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                        {card.myLetter}
                      </span>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {CATEGORIES.map(cat => (
                        <div key={cat} className="text-center border border-slate-800 p-3 bg-[#0e0e0e]">
                          <div className={`text-xl font-black font-sans ${getGradeColor(card.myBreakdown[cat])}`}>{card.myBreakdown[cat]}%</div>
                          <div className="font-mono text-[8px] text-slate-500 uppercase tracking-widest mt-1">{cat}</div>
                          <div className="font-mono text-[8px] text-slate-700 mt-0.5">Weight: {GRADE_WEIGHTS[cat as keyof typeof GRADE_WEIGHTS]}%</div>
                        </div>
                      ))}
                    </div>

                    {/* Weighted / Comparison */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-slate-800 bg-[#0e0e0e]">
                      <div>
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">YOUR_WEIGHTED_SCORE</div>
                        <span className={`text-3xl font-black font-sans ${getGradeColor(card.myWeighted)}`}>{card.myWeighted}%</span>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">CLASS_AVERAGE</div>
                        <span className="text-lg font-bold font-mono text-slate-400">{card.classAvg}%</span>
                      </div>
                      <div className="text-center">
                        <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-1">VS_AVG</div>
                        <span className={`text-lg font-bold font-mono flex items-center gap-1 ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          <TrendingUp className={`w-3 h-3 ${diff < 0 ? 'rotate-180' : ''}`} />
                          {diff >= 0 ? '+' : ''}{diff}%
                        </span>
                      </div>
                    </div>
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
