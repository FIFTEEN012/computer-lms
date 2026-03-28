import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, ExternalLink, Calendar, Users, BarChart3, Plus, Activity, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function GlobalTeacherQuizzesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all quizzes from classes owned by this teacher
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      classes (
        name,
        class_code
      ),
      quiz_questions (count),
      quiz_attempts (count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-6 h-full flex flex-col relative font-body text-text-main selection:bg-accent-secondary/20 selection:text-accent-secondary overflow-hidden italic scanlines bg-bg-primary">
      <div className="absolute inset-0 bg-accent-secondary/2 opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-20 right-10 p-4 opacity-[0.02] pointer-events-none z-0">
        <div className="font-heading text-[54px] leading-none select-none font-black text-accent-secondary/10 italic tracking-tighter uppercase">COGNITIVE_ARRAY</div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6 max-w-7xl mx-auto font-heading border-l-4 border-accent-secondary pl-6 py-3 workstation-panel !bg-transparent !border-r-0 !border-y-0 relative group">
        <div className="absolute inset-0 bg-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] text-foreground uppercase italic glitch-text neon-glaze leading-tight shadow-glow-pink" data-text="คลังแบบทดสอบส่วนกลาง">
            คลังแบบทดสอบส่วนกลาง // GLOBAL_QUIZ_REPO
          </h1>
          <p className="text-[10px] text-accent-secondary font-black uppercase tracking-[0.4em] mt-3 flex items-center italic border-l-2 border-accent-secondary/20 pl-6 not-italic">
             <span className="w-2 h-2 bg-accent-secondary mr-3 animate-ping rounded-full shadow-glow-pink"></span>
             DETECTED_{quizzes?.length || 0}_ASSESSMENT_UNITS // ARRAY_READY
          </p>
        </div>
        <Link href="/teacher/classes">
          <Button className="font-heading text-[10px] font-black tracking-[0.3em] uppercase rounded-none h-11 px-8 shadow-glow-pink transition-all hover:scale-[1.05] active:scale-95 bg-bg-secondary text-accent-secondary border border-accent-secondary/20 hover:border-accent-secondary italic">
            <Plus className="w-4 h-4 mr-3" /> เพิ่มหน่วยการประเมิน
          </Button>
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4 relative z-10 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz, i) => {
            const questionCount = (quiz.quiz_questions as any)[0]?.count || 0
            const attemptCount = (quiz.quiz_attempts as any)[0]?.count || 0

            return (
              <div key={quiz.id} className="workstation-panel bg-bg-secondary/40 border border-accent-secondary/5 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-accent-secondary/40 transition-all duration-700 group relative overflow-hidden shadow-2xl backdrop-blur-3xl hover:scale-[1.01] cursor-default h-fit">
                 <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-heading text-4xl italic font-black group-hover:opacity-10 transition-opacity text-foreground">ARRAY_0{i+1}</div>
                 <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-secondary/20 to-transparent"></div>
                 
                 <div className="relative z-10 flex-1">
                    <div className="flex items-center gap-6">
                       <div className="bg-bg-primary/50 p-4 border border-accent-secondary/20 group-hover:border-accent-secondary transition-all shadow-glow-pink clip-path-diag">
                          <BrainCircuit className="w-6 h-6 text-accent-secondary group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <h3 className="text-xl font-black text-foreground uppercase tracking-[0.1em] group-hover:text-accent-secondary transition-all truncate italic leading-tight font-body shadow-glow-pink" data-text={quiz.title.toUpperCase()}>{quiz.title}</h3>
                          <div className="font-heading text-[10px] text-text-muted font-black uppercase tracking-[0.3em] flex items-center gap-x-4 mt-2 italic">
                             <span>รายวิชา: <span className="text-foreground">{(quiz.classes as any)?.name}</span></span> 
                             <span className="opacity-20">|</span> 
                             <span>ID: <span className="text-accent-secondary digital-display">{(quiz.classes as any)?.class_code}</span></span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                    <div className="text-center md:text-left border-r border-accent-secondary/5 pr-6">
                      <p className="font-heading text-[8px] text-text-muted uppercase tracking-[0.3em] mb-1 italic">QUESTIONS</p>
                      <p className="font-heading font-black text-foreground text-sm digital-display">{questionCount}_UNITS</p>
                    </div>
                    <div className="text-center md:text-left border-r border-accent-secondary/5 pr-6">
                      <p className="font-heading text-[8px] text-text-muted uppercase tracking-[0.3em] mb-1 italic">ATTEMPTS</p>
                      <p className="font-heading font-black text-foreground text-sm digital-display">{attemptCount}_LOGS</p>
                    </div>
                    <div className="text-center md:text-left border-r border-accent-secondary/5 pr-6">
                       <p className="font-heading text-[8px] text-text-muted uppercase tracking-[0.3em] mb-1 italic">STATUS</p>
                       <div className={`font-heading text-[9px] uppercase font-black italic flex items-center gap-2 ${quiz.is_published ? 'text-emerald-400' : 'text-amber-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${quiz.is_published ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`}></div>
                          {quiz.is_published ? 'ACTIVE' : 'DRAFT'}
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link href={`/teacher/quizzes/${quiz.id}/edit`} className="flex-1 md:flex-initial">
                         <Button variant="outline" className="w-full md:w-auto workstation-panel border-accent-secondary/20 bg-bg-primary/50 hover:bg-accent-secondary/10 hover:border-accent-secondary h-11 px-4 transition-all !rounded-none">
                            <ExternalLink className="w-4 h-4 text-accent-secondary" />
                         </Button>
                      </Link>
                      <Link href={`/teacher/quizzes/${quiz.id}/results`} className="flex-1 md:flex-initial">
                         <Button className="w-full md:w-auto h-11 bg-accent-secondary text-white hover:bg-accent-secondary/90 font-black uppercase tracking-[0.3em] px-4 rounded-none border-none shadow-glow-pink">
                            <BarChart3 className="w-4 h-4" />
                         </Button>
                      </Link>
                    </div>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 h-0.5 bg-accent-secondary/40 w-0 group-hover:w-full transition-all duration-1000"></div>
              </div>
            )
          })
        ) : (
          <div className="workstation-panel bg-bg-secondary/40 border-dashed border-accent-secondary/10 p-24 text-center opacity-40 italic flex flex-col items-center justify-center">
             <Search className="w-16 h-16 text-accent-secondary/20 mb-6 animate-pulse" />
             <p className="font-heading text-[11px] text-text-muted font-black uppercase tracking-[0.4em] italic mb-6">NO_ASSESSMENTS_DETECTED_IN_ARRAY // ไม่พบข้อมูลแบบทดสอบ</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 workstation-panel bg-bg-secondary border-accent-secondary/10 flex items-center justify-between font-mono text-[9px] text-text-muted shrink-0">
           <div className="flex items-center gap-4">
              <Activity className="w-3 h-3 text-accent-secondary animate-pulse" />
              <span className="uppercase tracking-[0.3em] font-black italic">COGNITIVE_ARRAY: OPERATIONAL</span>
           </div>
           <div className="opacity-30 uppercase tracking-[0.2em] font-black italic">
              REPO_VERSION: 2.1.0_F
           </div>
        </div>
    </div>
  )
}
