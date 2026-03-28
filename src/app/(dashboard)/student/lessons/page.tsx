import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowRight, Clock, ShieldAlert, Database, Cpu, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function GlobalStudentLessonsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all lessons from all classes the student is enrolled in
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes (
        name,
        class_code,
        lessons (*)
      )
    `)
    .eq('student_id', user.id)

  const lessons = enrollments?.flatMap(e => (e.classes as any)?.lessons.map((l: any) => ({
    ...l,
    className: (e.classes as any).name,
    classCode: (e.classes as any).class_code
  }))) || []

  // Sort by created_at descending
  lessons.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="flex flex-col gap-10 py-6 h-full overflow-hidden">
      {/* HEADER SECTION - KNOWLEDGE FEED */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-l-8 border-accent-primary pl-10 py-4 relative group shrink-0">
        <div className="absolute inset-0 bg-accent-primary/[0.02] -z-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="space-y-3">
          <h1 className="font-heading text-6xl font-black uppercase tracking-tighter text-foreground italic shadow-glow-cyan/20 translate-x-[-4px]">
             KNOWLEDGE_FEED
          </h1>
          <p className="font-mono text-accent-primary/60 text-sm tracking-[0.4em] uppercase font-bold italic animate-pulse">
             SYNAPTIC_STREAMING_ACTIVE // MODULE_COUNT: {lessons.length}
          </p>
        </div>
        
        {/* Status Hub */}
        <div className="flex items-center gap-8 bg-bg-secondary p-6 border border-accent-primary/20 neon-glow-cyan relative overflow-hidden group-hover:border-accent-primary/40 transition-colors">
          <div className="flex flex-col items-end">
             <span className="font-heading text-[10px] text-accent-primary/60 uppercase tracking-[0.3em] font-black italic">DATABASE_UPLINK</span>
             <span className="font-mono text-lg font-black text-foreground digital-display">CONNECTED_STABLE</span>
          </div>
          <Database className="w-10 h-10 text-accent-primary animate-pulse" />
        </div>
      </div>

      {/* CORE LIST - Viewport Fitted */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12">
        <div className="space-y-8">
          {lessons.length > 0 ? (
            lessons.map((lesson, i) => (
              <div key={lesson.id} className="bg-bg-secondary/40 border border-accent-primary/10 relative group hover:bg-bg-elevated/40 hover:border-accent-primary/40 transition-all duration-700 flex flex-col md:flex-row overflow-hidden shadow-2xl">
                 {/* Background Sequence Marker */}
                 <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] font-mono text-9xl italic font-black text-white pointer-events-none group-hover:opacity-10 transition-opacity">
                   {i < 9 ? `0${i+1}` : i+1}
                 </div>

                 {/* Left Accent Line */}
                 <div className="w-1 h-auto bg-accent-primary/10 group-hover:bg-accent-primary transition-colors duration-700 shadow-glow-cyan"></div>

                 <div className="p-10 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
                    <div className="flex items-start gap-8">
                       <div className="p-5 bg-bg-primary/50 border border-accent-primary/20 group-hover:border-accent-primary transition-all shadow-glow-cyan">
                          <BookOpen className="w-8 h-8 text-accent-primary group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div>
                          <div className="flex items-center gap-4 mb-3">
                             <Cpu className="w-4 h-4 text-accent-primary/40" />
                             <span className="font-mono text-[9px] text-accent-primary/60 font-black uppercase tracking-[0.4em] italic mb-1 pt-1">NODE_SECTOR: {lesson.classCode}</span>
                          </div>
                          <h3 className="font-thai-heading text-3xl font-black text-foreground uppercase tracking-tight group-hover:text-accent-primary transition-colors italic leading-tight mb-4">{lesson.title}</h3>
                          <div className="flex items-center gap-6">
                             <span className="font-mono text-[10px] text-text-muted font-black uppercase tracking-[0.2em] italic bg-bg-primary px-3 py-1 border border-accent-primary/5">{lesson.className}</span>
                             <span className="font-mono text-[10px] text-accent-primary/40 font-black tracking-[0.4em] italic uppercase">DATA_INGESTED: {new Date(lesson.created_at).toISOString().split('T')[0]}</span>
                          </div>
                       </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                       <Link href={`/student/lessons/${lesson.id}`}>
                          <Button className="h-16 px-12 bg-accent-primary/5 border border-accent-primary/20 text-foreground hover:bg-accent-primary hover:text-bg-primary font-heading text-[10px] tracking-[0.6em] uppercase transition-all duration-1000 font-black italic shadow-inner group/btn">
                             <div className="absolute inset-x-0 bottom-0 h-0 transition-all duration-300 group-hover/btn:h-full bg-accent-primary/10 -z-10"></div>
                             <span className="relative z-10 flex items-center justify-center gap-6">
                                DOWNLOAD_MODULE <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-4 transition-transform duration-700 ease-out" />
                             </span>
                          </Button>
                       </Link>
                    </div>
                 </div>

                 {/* Industrial Corner Brackets */}
                 <div className="bracket-tl w-2 h-2 border-accent-primary/40 translate-x-1 translate-y-1"></div>
                 <div className="bracket-br w-2 h-2 border-accent-primary/40 -translate-x-1 -translate-y-1"></div>
              </div>
            ))
          ) : (
            <div className="bg-bg-secondary/40 border border-accent-primary/10 p-40 text-center relative overflow-hidden group shadow-2xl hover:border-accent-primary/40 transition-all opacity-40">
               <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
               <ShieldAlert className="w-24 h-24 text-accent-primary/20 mx-auto mb-10 animate-pulse drop-shadow-glow-cyan" />
               <p className="font-mono text-sm text-text-muted font-black uppercase tracking-[0.6em] leading-relaxed relative z-10 italic">
                  // ERROR_404: NO_KNOWLEDGE_MODULES_DETECTED
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER DIAGNOSTICS */}
      <div className="flex items-center justify-between border-t border-accent-primary/10 pt-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic shrink-0">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <Activity className="w-3 h-3 text-accent-primary/40 animate-pulse" />
               FEED_LATENCY: <span className="text-foreground">04MS</span>
            </div>
            <div className="flex items-center gap-3">
               <Database className="w-3 h-3 text-accent-primary/40" />
               SYNC_NODES: <span className="text-foreground">STRETCH_V1</span>
            </div>
         </div>
         <div className="text-accent-primary/40">KNOWLEDGE_STREAM_VERSION: v2.5.0-STABLE</div>
      </div>
    </div>
  )
}
