import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Hash, ArrowRight, UserCircle2, Terminal, Database, ShieldCheck, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EnrollClassModal from '@/components/student/EnrollClassModal'
import LeaveClassButton from '@/components/student/LeaveClassButton'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StudentClassesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id, 
      classes (
        id,
        name, 
        description,
        class_code, 
        academic_year,
        semester,
        teacher_id,
        profiles!classes_teacher_id_fkey (full_name)
      )
    `)
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })

  return (
    <div className="flex flex-col gap-10 py-6 h-full overflow-hidden">
      {/* HEADER SECTION - NODE ARCHIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-l-8 border-accent-primary pl-10 py-4 relative group shrink-0">
        <div className="absolute inset-0 bg-accent-primary/[0.02] -z-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="space-y-3">
          <h1 className="font-heading text-6xl font-black uppercase tracking-tighter text-foreground italic shadow-glow-cyan/20 translate-x-[-4px]">
             NODE_ARCHIVE
          </h1>
          <p className="font-mono text-accent-primary/60 text-sm tracking-[0.4em] uppercase font-bold italic animate-pulse">
             ENROLLED_SECTORS // ACTIVE_NODES: {enrollments?.length || 0}
          </p>
        </div>
        
        <div className="flex items-center gap-8 relative z-10">
          <div className="bg-bg-secondary p-4 border border-accent-primary/20 neon-glow-cyan flex items-center gap-5 group/modal hover:border-accent-primary transition-colors">
             <div className="flex flex-col items-end">
                <span className="font-heading text-[9px] text-accent-primary/60 uppercase tracking-[0.3em] font-black italic">DEPLOY_NEW</span>
                <span className="font-mono text-xs font-black text-foreground">ENROLL_NODE</span>
             </div>
             <EnrollClassModal />
          </div>
        </div>
      </div>

      {/* CORE GRID - Viewport Fitted */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments?.map((enr, i) => {
            const cls = enr.classes as any
            const teacher = cls.profiles
            
            return (
              <div key={cls.id} className="bg-bg-secondary/40 border border-accent-primary/10 relative group hover:bg-bg-elevated/40 hover:border-accent-primary/40 transition-all duration-700 flex flex-col overflow-hidden shadow-2xl">
                 {/* Background Sequence Marker */}
                 <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] font-mono text-8xl italic font-black text-white pointer-events-none group-hover:opacity-10 transition-opacity">
                   {i < 9 ? `0${i+1}` : i+1}
                 </div>

                 {/* Top Accent Line */}
                 <div className="h-1 w-full bg-accent-primary/10 group-hover:bg-accent-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 shadow-glow-cyan"></div>

                 <div className="p-10 flex-1 flex flex-col relative z-10">
                    <div className="mb-8 min-h-[100px]">
                       <div className="flex items-center gap-3 mb-4">
                          <Database className="w-4 h-4 text-accent-primary/40" />
                          <span className="font-mono text-[9px] text-accent-primary/60 font-black uppercase tracking-[0.4em] italic mb-1 pt-1">NODE_ID: {cls.class_code}</span>
                       </div>
                       <h3 className="font-thai-heading text-3xl font-black text-foreground uppercase tracking-tight group-hover:text-accent-primary transition-colors line-clamp-2 italic leading-tight mb-4">{cls.name}</h3>
                       <p className="font-thai-heading text-[11px] text-text-muted leading-relaxed uppercase italic line-clamp-2 group-hover:text-foreground/70 transition-colors">
                         {cls.description || 'STATUS: NO_ADDITIONAL_INTEL_PROVIDED_BY_ARCHITECT'}
                       </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="space-y-4 mb-10 border-t border-accent-primary/5 pt-8">
                       <div className="flex items-center justify-between group/meta">
                          <div className="flex items-center gap-3">
                             <UserCircle2 className="w-4 h-4 text-text-muted group-hover/meta:text-accent-primary transition-colors" />
                             <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.2em] font-black italic">INSTRUCTOR</span>
                          </div>
                          <span className="font-thai-heading text-[11px] text-foreground font-black uppercase italic">{teacher?.full_name || 'UNKNOWN_OP'}</span>
                       </div>
                       <div className="flex items-center justify-between group/meta">
                          <div className="flex items-center gap-3">
                             <Calendar className="w-4 h-4 text-text-muted group-hover/meta:text-accent-primary transition-colors" />
                             <span className="font-mono text-[9px] text-text-muted uppercase tracking-[0.2em] font-black italic">TIMELINE</span>
                          </div>
                          <span className="font-mono text-[11px] text-foreground font-black digital-display italic">{cls.academic_year} // SEM_0{cls.semester}</span>
                       </div>
                    </div>

                    <div className="mt-auto flex gap-6">
                       <Link href={`/student/classes/${cls.id}`} className="flex-1">
                          <Button className="w-full h-14 bg-accent-primary/5 border border-accent-primary/20 text-foreground hover:bg-accent-primary hover:text-bg-primary font-heading text-[10px] tracking-[0.5em] uppercase transition-all duration-700 font-black italic shadow-inner group/btn">
                             <div className="absolute inset-x-0 bottom-0 h-0 transition-all duration-300 group-hover/btn:h-full bg-accent-primary/10 -z-10"></div>
                             <span className="relative z-10 flex items-center justify-center gap-4">
                                UPLINK_NODE <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-3 transition-transform duration-500 ease-out" />
                             </span>
                          </Button>
                       </Link>
                       <div className="shrink-0 w-14 h-14">
                          <LeaveClassButton classId={cls.id} />
                       </div>
                    </div>
                 </div>

                 {/* Industrial Corner Brackets */}
                 <div className="bracket-tl w-2 h-2 border-accent-primary/40 group-hover:scale-125 transition-all"></div>
                 <div className="bracket-br w-2 h-2 border-accent-primary/40 group-hover:scale-125 transition-all"></div>
              </div>
            )
          })}

          {(!enrollments || enrollments.length === 0) && (
            <div className="col-span-full bg-bg-secondary/40 border border-accent-primary/10 p-32 text-center relative overflow-hidden group shadow-2xl hover:border-accent-primary/40 transition-all italic opacity-40">
               <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
               <Terminal className="w-24 h-24 text-accent-primary/20 mx-auto mb-10 animate-pulse drop-shadow-glow-cyan" />
               <p className="font-mono text-sm text-text-muted font-black uppercase tracking-[0.6em] leading-relaxed relative z-10">
                  // ERROR_404: NO_ENROLLED_NODES_DETECED
               </p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER DIAGNOSTICS */}
      <div className="flex items-center justify-between border-t border-accent-primary/10 pt-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic shrink-0">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <ShieldCheck className="w-3 h-3 text-accent-primary/40" />
               NODE_INTEGRITY: <span className="text-foreground">VERIFIED_SECURE</span>
            </div>
            <div className="flex items-center gap-3">
               <Activity className="w-3 h-3 text-accent-primary/40 animate-pulse" />
               NETWORK_LOAD: <span className="text-foreground">0.12PF</span>
            </div>
         </div>
         <div className="text-accent-primary/40">NODE_ARCHIVE_PROTOCOL: v2.5.1-DISTRO</div>
      </div>
    </div>
  )
}
