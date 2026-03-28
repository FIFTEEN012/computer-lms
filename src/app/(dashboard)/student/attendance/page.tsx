import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowRight, ShieldAlert, Award, Fingerprint, Activity, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function GlobalStudentAttendancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all enrollments
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes (
        name,
        class_code
      )
    `)
    .eq('student_id', user.id)

  return (
    <div className="flex flex-col gap-10 py-6 h-full overflow-hidden">
      {/* HEADER SECTION - PRESENCE CORE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-l-8 border-accent-tertiary pl-10 py-4 relative group shrink-0">
        <div className="absolute inset-0 bg-accent-tertiary/[0.02] -z-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
        <div className="space-y-3">
          <h1 className="font-heading text-6xl font-black uppercase tracking-tighter text-foreground italic shadow-glow-emerald/20 translate-x-[-4px]">
            PRESENCE_STREAMS
          </h1>
          <p className="font-mono text-accent-tertiary/60 text-sm tracking-[0.4em] uppercase font-bold italic animate-pulse">
            TRACKING_BIOMETRIC_SIGNATURES // SECTOR_LINK: ACTIVE
          </p>
        </div>
        
        {/* Status Hub */}
        <div className="flex items-center gap-8 bg-bg-secondary p-6 border border-accent-tertiary/20 neon-glow-green relative overflow-hidden group-hover:border-accent-tertiary/40 transition-colors">
          <div className="flex flex-col items-end">
             <span className="font-heading text-[10px] text-accent-tertiary/60 uppercase tracking-[0.3em] font-black italic">GLOBAL_UPLINK</span>
             <span className="font-mono text-lg font-black text-foreground digital-display">98.2%_READY</span>
          </div>
          <Fingerprint className="w-10 h-10 text-accent-tertiary animate-pulse" />
        </div>
      </div>

      {/* CORE GRID - Viewport Fitted */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments && enrollments.length > 0 ? (
            enrollments.map((enr, i) => {
              const cls = enr.classes as any
              const presenceRatio = [95, 82, 100, 74, 91][i % 5] || 85
              return (
                <div key={enr.class_id} className="bg-bg-secondary/40 border border-accent-tertiary/10 relative group hover:bg-bg-elevated/40 hover:border-accent-tertiary/40 transition-all duration-700 flex flex-col overflow-hidden shadow-2xl">
                   {/* Background Index Marker */}
                   <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] font-mono text-8xl italic font-black text-white pointer-events-none group-hover:opacity-10 transition-opacity">
                     {i < 9 ? `0${i+1}` : i+1}
                   </div>
                   
                   {/* Top Accent Line */}
                   <div className="h-1 w-full bg-accent-tertiary/10 group-hover:bg-accent-tertiary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700 shadow-glow-emerald"></div>
                   
                   <div className="p-10 flex flex-col h-full relative z-10">
                      <div className="mb-10 min-h-[80px]">
                         <h3 className="font-thai-heading text-2xl font-black text-foreground uppercase tracking-tight group-hover:text-accent-tertiary transition-colors line-clamp-2 italic leading-tight mb-4">{cls.name}</h3>
                         <div className="font-mono text-[9px] text-text-muted font-bold tracking-[0.4em] uppercase opacity-40 group-hover:opacity-100 transition-opacity">
                           SECTOR_ID: <span className="text-accent-tertiary">{cls.class_code}</span>
                         </div>
                      </div>
                      
                      {/* Metric Cluster */}
                      <div className="grid grid-cols-2 gap-6 mb-12">
                         <div className="space-y-2">
                            <span className="font-mono text-[8px] text-text-dim uppercase tracking-widest font-black">PRESENCE_RATIO</span>
                            <div className="text-3xl font-heading font-black text-foreground digital-display">{presenceRatio}%</div>
                         </div>
                         <div className="space-y-2">
                            <span className="font-mono text-[8px] text-text-dim uppercase tracking-widest font-black">UPLINK_STATUS</span>
                            <div className="text-[10px] font-mono font-black text-accent-tertiary/80 uppercase tracking-widest flex items-center gap-2">
                               <div className="w-1.5 h-1.5 bg-accent-tertiary animate-ping rounded-full" />
                               SYNCHRONIZED
                            </div>
                         </div>
                      </div>
                      
                      {/* Progress Visual */}
                      <div className="h-0.5 w-full bg-accent-tertiary/5 mb-12 relative overflow-hidden">
                         <div className="absolute left-0 top-0 h-full bg-accent-tertiary shadow-glow-emerald transition-all duration-1000 w-0 group-hover:w-full" style={{ width: `${presenceRatio}%` }}></div>
                         <div className="absolute inset-0 bg-accent-tertiary/20 pattern-grid opacity-20"></div>
                      </div>
                      
                      <Link href={`/student/classes/${enr.class_id}/attendance`} className="mt-auto">
                         <Button className="w-full h-14 bg-accent-tertiary/5 border border-accent-tertiary/20 text-foreground hover:bg-accent-tertiary hover:text-bg-primary font-heading text-[10px] tracking-[0.5em] uppercase transition-all duration-700 font-black italic shadow-inner group/btn">
                            <span className="relative z-10 flex items-center justify-center gap-4">
                               ACCESS_CORE_LOGS <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-3 transition-transform duration-500 ease-out" />
                            </span>
                         </Button>
                      </Link>
                   </div>
                   
                   {/* Industrial Corner Brackets */}
                   <div className="bracket-tl group-hover:border-accent-tertiary group-hover:scale-125 transition-all"></div>
                   <div className="bracket-br group-hover:border-accent-tertiary group-hover:scale-125 transition-all"></div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full bg-bg-secondary/40 border border-accent-tertiary/10 p-32 text-center relative overflow-hidden group shadow-2xl hover:border-accent-tertiary/40 transition-all">
               <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
               <ShieldAlert className="w-24 h-24 text-accent-tertiary/20 mx-auto mb-10 animate-pulse drop-shadow-glow-emerald" />
               <p className="font-mono text-sm text-text-muted font-black uppercase tracking-[0.6em] leading-relaxed relative z-10 italic">
                  // ERROR_404: NO_PRESENCE_DATA_STREAM_DETECTED
               </p>
               <div className="mt-12 opacity-10 font-mono text-[10px] tracking-[1em] uppercase">SYSTEM_IDLE // SESSION_TERM</div>
            </div>
          )}
        </div>
      </div>
      
      {/* FOOTER DIAGNOSTICS */}
      <div className="flex items-center justify-between border-t border-accent-tertiary/10 pt-6 font-mono text-[9px] text-text-muted uppercase tracking-[0.4em] font-black italic shrink-0">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
               <Clock className="w-3 h-3 text-accent-tertiary/40" />
               UPTIME: <span className="text-foreground">04:42:12</span>
            </div>
            <div className="flex items-center gap-3">
               <Activity className="w-3 h-3 text-accent-tertiary/40" />
               LATENCY: <span className="text-foreground">12MS</span>
            </div>
         </div>
         <div className="text-accent-tertiary/40">NODE_VERSION: v1.0.4-STABLE_PRO</div>
      </div>
    </div>
  )
}
