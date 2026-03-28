import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GRADE_WEIGHTS, calculateWeightedScore, getGradeLetter, getGradeColor } from '@/lib/utils/grades'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Award, Activity, Search, ShieldCheck, Database, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const CATEGORIES = Object.keys(GRADE_WEIGHTS)

const categoryTranslation: Record<string, string> = {
  'Assignments': 'งานมอบหมาย',
  'Quizzes': 'แบบทดสอบ',
  'Midterm': 'สอบกลางภาค',
  'Final': 'สอบปลายภาค'
}

const categoryEnglish: Record<string, string> = {
  'Assignments': 'ASSIGNMENTS_CORE',
  'Quizzes': 'QUIZ_ASSESSMENTS',
  'Midterm': 'MIDTERM_EVAL',
  'Final': 'FINAL_UPLINK'
}

export default async function StudentGradesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get enrolled classes
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes!inner(id, name, class_code)')
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
    const classCode = enrollment.classes.class_code

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

    return { classId, className, classCode, myWeighted, myBreakdown, myLetter: getGradeLetter(myWeighted), classAvg }
  })

  return (
    <div className="flex flex-col gap-10 py-6 h-full overflow-hidden">
      {/* HEADER SECTION - PERFORMANCE MATRIX */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-l-8 border-accent-primary pl-10 py-4 relative group shrink-0">
        <div className="absolute inset-0 bg-accent-primary/[0.02] -z-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/student/dashboard" className="p-2 bg-bg-secondary border border-accent-primary/20 hover:bg-accent-primary/10 transition-colors group/back">
              <ArrowLeft className="w-4 h-4 text-accent-primary group-hover/back:-translate-x-1 transition-transform" />
            </Link>
            <span className="font-mono text-[10px] text-accent-primary tracking-[0.4em] uppercase font-black italic">RETURN_TO_CORE_DASHBOARD</span>
          </div>
          <h1 className="font-heading text-6xl font-black uppercase tracking-tighter text-foreground italic shadow-glow-cyan/20 translate-x-[-4px]">
             GRADE_ARCHIVE
          </h1>
          <p className="font-mono text-accent-primary/60 text-sm tracking-[0.4em] uppercase font-bold italic animate-pulse">
             DECRYPTING_PERFORMANCE_METRICS // SOURCE: NODE_CS_LMS_2.5
          </p>
        </div>
        
        {/* Status Hub */}
        <div className="flex items-center gap-8 bg-bg-secondary p-6 border border-accent-primary/20 neon-glow-cyan relative overflow-hidden group-hover:border-accent-primary/40 transition-colors">
          <div className="flex flex-col items-end">
             <span className="font-heading text-[10px] text-accent-primary/60 uppercase tracking-[0.3em] font-black italic">DATA_INTEGRITY</span>
             <span className="font-mono text-lg font-black text-foreground digital-display">VERIFIED_SECURE</span>
          </div>
          <ShieldCheck className="w-10 h-10 text-accent-primary animate-pulse" />
        </div>
      </div>

      {/* CORE LIST - Viewport Fitted */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12">
        {classCards.length === 0 ? (
          <div className="bg-bg-secondary/40 border border-accent-primary/10 p-32 text-center relative overflow-hidden group shadow-2xl hover:border-accent-primary/40 transition-all italic">
             <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
             <Search className="w-24 h-24 text-accent-primary/20 mx-auto mb-10 animate-pulse drop-shadow-glow-cyan" />
             <p className="font-mono text-sm text-text-muted font-black uppercase tracking-[0.6em] leading-relaxed relative z-10">
                // ERROR_404: NO_GRADE_STREAMS_DETECTED
             </p>
          </div>
        ) : (
          <div className="space-y-12">
            {classCards.map((card, i) => {
              const diff = card.myWeighted - card.classAvg
              return (
                <div key={card.classId} className="bg-bg-secondary/40 border border-accent-primary/10 relative group hover:bg-bg-elevated/40 hover:border-accent-primary/40 transition-all duration-700 flex flex-col overflow-hidden shadow-2xl">
                   {/* Background Sequence Marker */}
                   <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] font-mono text-9xl italic font-black text-white pointer-events-none group-hover:opacity-10 transition-opacity">
                     {i < 9 ? `0${i+1}` : i+1}
                   </div>

                   {/* Card Header Area */}
                   <div className="p-10 border-b border-accent-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-bg-secondary/60">
                      <div className="flex-1">
                         <div className="flex items-center gap-4 mb-4">
                            <Database className="w-5 h-5 text-accent-primary/40" />
                            <span className="font-mono text-[10px] text-accent-primary font-black uppercase tracking-[0.4em] italic mb-1 pt-1">NODE_SECTOR: {card.classCode}</span>
                         </div>
                         <h3 className="font-thai-heading text-3xl font-black text-foreground uppercase tracking-tight group-hover:text-accent-primary transition-colors italic leading-tight">{card.className}</h3>
                      </div>
                      
                      {/* Big Grade Badge */}
                      <div className="flex items-center gap-10">
                        <div className="flex flex-col items-end">
                           <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic mb-2">FINAL_GRADE</span>
                           <div className={cn("text-6xl font-heading font-black italic digital-display leading-none", 
                             card.myWeighted >= 80 ? "text-accent-tertiary neon-glow-green" : 
                             card.myWeighted >= 50 ? "text-accent-primary neon-glow-cyan" : "text-accent-secondary neon-glow-pink"
                           )}>
                              {card.myLetter}
                           </div>
                        </div>
                      </div>
                   </div>

                   {/* Grade Breakdown Visual Grid */}
                   <div className="p-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
                      {CATEGORIES.map(cat => (
                        <div key={cat} className="p-8 bg-bg-primary/40 border border-accent-primary/5 flex flex-col items-center justify-center group/cat hover:border-accent-primary/30 transition-all relative">
                           <div className="absolute top-2 left-2 font-mono text-[8px] opacity-10 font-bold tracking-widest">{cat.toUpperCase()}</div>
                           <div className={cn("text-4xl font-heading font-black italic digital-display mb-3", getGradeColor(card.myBreakdown[cat]))}>
                             {card.myBreakdown[cat]}%
                           </div>
                           <div className="font-thai-heading text-[11px] text-text-muted uppercase tracking-widest font-black group-hover/cat:text-foreground transition-colors">{categoryTranslation[cat]}</div>
                           <div className="font-mono text-[8px] text-text-dim mt-2 tracking-[0.2em] font-black italic">{categoryEnglish[cat]}</div>
                           
                           {/* Corner Brackets for Category */}
                           <div className="bracket-tl w-1.5 h-1.5 border-accent-primary/20"></div>
                           <div className="bracket-br w-1.5 h-1.5 border-accent-primary/20"></div>
                        </div>
                      ))}
                   </div>

                   {/* Performance Feedback Bar */}
                   <div className="px-10 py-8 bg-bg-secondary/40 border-t border-accent-primary/5 grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="flex flex-col border-r border-accent-primary/5">
                        <span className="font-mono text-[9px] text-accent-primary uppercase tracking-[0.4em] font-black italic mb-3">WEIGHTED_OVERALL</span>
                        <div className="flex items-baseline gap-4">
                           <span className={cn("text-4xl font-heading font-black italic digital-display leading-none", getGradeColor(card.myWeighted))}>{card.myWeighted}%</span>
                           <div className="h-6 w-[1px] bg-accent-primary/20 rotate-12"></div>
                           <span className="text-[10px] text-text-muted uppercase font-black italic tracking-widest">NET_SCORE</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col border-r border-accent-primary/5">
                        <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic mb-3">CLASS_AVG_MATRIX</span>
                        <div className="flex items-baseline gap-4">
                           <span className="text-3xl font-heading font-black text-foreground/40 italic digital-display leading-none">{card.classAvg}%</span>
                           <LayoutGrid className="w-4 h-4 text-text-muted/20" />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="font-mono text-[9px] text-accent-secondary uppercase tracking-[0.4em] font-black italic mb-3">DEVIATION_PROTOCOL</span>
                        <div className="flex items-center gap-6">
                           <div className={cn("text-3xl font-heading font-black italic digital-display flex items-center gap-3", diff >= 0 ? "text-accent-tertiary" : "text-accent-secondary")}>
                              {diff >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                              {diff >= 0 ? '+' : ''}{diff}%
                           </div>
                           <div className={cn("w-3 h-3 animate-pulse shadow-glow-cyan", diff >= 0 ? "bg-accent-tertiary" : "bg-accent-secondary")}></div>
                        </div>
                      </div>
                   </div>

                   {/* Final Visual Progress Meter */}
                   <div className="h-1 w-full bg-accent-primary/5 overflow-hidden">
                      <div className={cn("h-full transition-all duration-1000 ease-in-out w-0 group-hover:w-full", getGradeColor(card.myWeighted).replace('text-', 'bg-'))} style={{ width: `${card.myWeighted}%` }}></div>
                   </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FOOTER DIAGNOSTICS */}
      <div className="flex items-center justify-between border-t border-accent-primary/10 pt-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic shrink-0">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <Activity className="w-3 h-3 text-accent-primary animate-pulse" />
               SYNC_STATUS: <span className="text-foreground">STABLE_CONNECT_RX-44</span>
            </div>
         </div>
         <div className="text-accent-primary/30">PROTOCOL_V2 // UPLINK_SUCCESSFUL</div>
      </div>
    </div>
  )
}
