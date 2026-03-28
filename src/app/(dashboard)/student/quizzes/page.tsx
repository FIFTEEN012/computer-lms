import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, ArrowRight, Zap, ShieldAlert, Activity, Binary, Cpu, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function GlobalStudentQuizzesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all quizzes from all classes the student is enrolled in
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes (
        name,
        class_code,
        quizzes (*)
      )
    `)
    .eq('student_id', user.id)

  const quizzes = enrollments?.flatMap(e => (e.classes as any)?.quizzes.map((q: any) => ({
    ...q,
    className: (e.classes as any).name,
    classCode: (e.classes as any).class_code
  }))).filter(q => q.is_published) || []

  // Sort by created_at descending
  quizzes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="flex flex-col gap-10 py-6 h-full overflow-hidden">
      {/* HEADER SECTION - COGNITIVE ARRAY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-l-8 border-accent-secondary pl-10 py-4 relative group shrink-0">
        <div className="absolute inset-0 bg-accent-secondary/[0.02] -z-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="space-y-3">
          <h1 className="font-heading text-6xl font-black uppercase tracking-tighter text-foreground italic shadow-glow-pink/20 translate-x-[-4px]">
             COGNITIVE_ARRAY
          </h1>
          <p className="font-mono text-accent-secondary/60 text-sm tracking-[0.4em] uppercase font-bold italic animate-pulse">
             ASSESSMENT_STREAM_UPLINK // MODE: EVALUATION_ACTIVE
          </p>
        </div>
        
        {/* Status Hub */}
        <div className="flex items-center gap-8 bg-bg-secondary p-6 border border-accent-secondary/20 neon-glow-pink relative overflow-hidden group-hover:border-accent-secondary/40 transition-colors">
          <div className="flex flex-col items-end">
             <span className="font-heading text-[10px] text-accent-secondary/60 uppercase tracking-[0.3em] font-black italic">ARRAY_SYNC</span>
             <span className="font-mono text-lg font-black text-foreground digital-display">READY_FOR_DEPLOY</span>
          </div>
          <Cpu className="w-10 h-10 text-accent-secondary animate-pulse" />
        </div>
      </div>

      {/* CORE GRID - Viewport Fitted */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quizzes.length > 0 ? (
            quizzes.map((quiz, i) => (
              <div key={quiz.id} className="bg-bg-secondary/40 border border-accent-secondary/10 relative group hover:bg-bg-elevated/40 hover:border-accent-secondary/40 transition-all duration-700 flex flex-col overflow-hidden shadow-2xl">
                 {/* Background Sequence Marker */}
                 <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] font-mono text-8xl italic font-black text-white pointer-events-none group-hover:opacity-10 transition-opacity">
                   {i < 9 ? `0${i+1}` : i+1}
                 </div>

                 {/* Top Accent Line */}
                 <div className="h-1 w-full bg-accent-secondary/10 group-hover:bg-accent-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 shadow-glow-pink"></div>

                 <div className="p-10 flex flex-col h-full relative z-10">
                    <div className="mb-8 min-h-[90px]">
                       <div className="flex items-center gap-3 mb-4">
                          <Binary className="w-4 h-4 text-accent-secondary/40" />
                          <span className="font-mono text-[9px] text-accent-secondary/60 font-black uppercase tracking-[0.4em] italic">{quiz.className}</span>
                       </div>
                       <h3 className="font-thai-heading text-2xl font-black text-foreground uppercase tracking-tight group-hover:text-accent-secondary transition-colors line-clamp-2 italic leading-tight mb-4">{quiz.title}</h3>
                    </div>

                    {/* Metric Blocks */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                       <div className="p-4 bg-bg-primary/40 border border-accent-secondary/5 group-hover:border-accent-secondary/10 transition-all">
                          <div className="font-mono text-[8px] text-text-muted uppercase tracking-[0.2em] mb-2 font-black italic">DURATION_T_LIMIT</div>
                          <div className="text-xl font-heading font-black text-foreground digital-display">{quiz.time_limit} MINS</div>
                       </div>
                       <div className="p-4 bg-bg-primary/40 border border-accent-secondary/5 group-hover:border-accent-secondary/10 transition-all">
                          <div className="font-mono text-[8px] text-text-muted uppercase tracking-[0.2em] mb-2 font-black italic">PASS_THRESHOLD</div>
                          <div className="text-xl font-heading font-black text-accent-secondary digital-display">{quiz.passing_score}%</div>
                       </div>
                    </div>

                    <div className="mt-auto">
                       <Link href={`/student/quizzes/${quiz.id}`}>
                          <Button className="w-full h-14 bg-accent-secondary/5 border border-accent-secondary/20 text-foreground hover:bg-accent-secondary hover:text-bg-primary font-heading text-[10px] tracking-[0.5em] uppercase transition-all duration-700 font-black italic shadow-inner group/btn">
                             <div className="absolute inset-x-0 bottom-0 h-0 transition-all duration-300 group-hover/btn:h-full bg-accent-secondary/10 -z-10"></div>
                             <span className="relative z-10 flex items-center justify-center gap-4">
                                START_CHALLENGE <Zap className="w-4 h-4 group-hover/btn:translate-x-3 transition-transform duration-500 ease-out fill-accent-secondary/20 shadow-glow-pink" />
                             </span>
                          </Button>
                       </Link>
                    </div>
                 </div>

                 {/* Industrial Corner Brackets */}
                 <div className="bracket-tl w-2 h-2 border-accent-secondary/40 group-hover:scale-125 transition-all"></div>
                 <div className="bracket-br w-2 h-2 border-accent-secondary/40 group-hover:scale-125 transition-all"></div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-bg-secondary/40 border border-accent-secondary/10 p-32 text-center relative overflow-hidden group shadow-2xl hover:border-accent-secondary/40 transition-all">
               <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
               <ShieldAlert className="w-24 h-24 text-accent-secondary/20 mx-auto mb-10 animate-pulse drop-shadow-glow-pink" />
               <p className="font-mono text-sm text-text-muted font-black uppercase tracking-[0.6em] leading-relaxed relative z-10 italic">
                  // ERROR_404: NO_CHALLENGE_STREAMS_DETECTED
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER DIAGNOSTICS */}
      <div className="flex items-center justify-between border-t border-accent-secondary/10 pt-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic shrink-0">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <Clock className="w-3 h-3 text-accent-secondary/40" />
               ARRAY_UPTIME: <span className="text-foreground">04:42:12</span>
            </div>
            <div className="flex items-center gap-3">
               <Activity className="w-3 h-3 text-accent-secondary/40" />
               LATENCY: <span className="text-foreground">08MS</span>
            </div>
         </div>
         <div className="text-accent-secondary/40">ARRAY_VERSION: v1.0.4-STABLE_PRO</div>
      </div>
    </div>
  )
}
