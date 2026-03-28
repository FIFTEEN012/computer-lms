import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Users, ArrowRight, ShieldAlert, Activity, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function GlobalTeacherAttendancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all classes owned by this teacher
  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      class_code,
      class_enrollments (count)
    `)
    .eq('teacher_id', user.id)

  return (
    <div className="p-4 md:p-6 h-full flex flex-col relative font-body text-text-main selection:bg-emerald-500/20 selection:text-emerald-400 overflow-hidden italic scanlines bg-bg-primary">
      <div className="absolute inset-0 bg-emerald-500/2 opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-20 right-10 p-4 opacity-[0.02] pointer-events-none z-0">
        <div className="font-heading text-[54px] leading-none select-none font-black text-emerald-500/20 italic tracking-tighter uppercase transition-opacity">PRESENCE_CORE</div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6 max-w-7xl mx-auto font-heading border-l-4 border-emerald-500 pl-6 py-3 workstation-panel !bg-transparent !border-r-0 !border-y-0 relative group">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] text-foreground uppercase italic glitch-text neon-glaze leading-tight shadow-glow-emerald" data-text="ศูนย์ควบคุมการเช็คชื่อ">
            ศูนย์ควบคุมการเช็คชื่อ // ATTENDANCE_CORE
          </h1>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.4em] mt-3 flex items-center italic border-l-2 border-emerald-500/20 pl-6 not-italic">
             <span className="w-2 h-2 bg-emerald-500 mr-3 animate-ping rounded-full shadow-glow-emerald"></span>
             SENSOR_ARRAY_ACTIVE // พร้อมสำหรับการตรวจสอบตัวตน
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-7xl mx-auto flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {classes && classes.length > 0 ? (
          classes.map((cls, i) => (
            <div key={cls.id} className="workstation-panel bg-bg-secondary/40 border border-emerald-500/10 hover:border-emerald-500/40 p-8 flex flex-col justify-between transition-all duration-700 group relative overflow-hidden shadow-2xl backdrop-blur-3xl hover:scale-[1.01] cursor-default h-fit">
               <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-heading text-4xl italic font-black group-hover:opacity-10 transition-opacity text-foreground">SENSOR_0{i+1}</div>
               <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
               
               <div className="relative z-10 mb-8">
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-[0.1em] group-hover:text-emerald-400 transition-all italic leading-tight font-body shadow-glow-emerald" data-text={cls.name.toUpperCase()}>{cls.name}</h3>
                  <div className="flex items-center gap-3 mt-4">
                     <div className="h-1 w-12 bg-emerald-500/30 group-hover:w-full transition-all duration-1000 shadow-glow-emerald"></div>
                     <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em] italic digital-display">{cls.class_code}</span>
                  </div>
               </div>
               
               <div className="relative z-10 space-y-4 mb-10">
                  <div className="flex items-center gap-4 text-text-muted group-hover:text-foreground transition-colors">
                     <div className="p-2 workstation-panel border-emerald-500/10 bg-bg-primary/50">
                        <Users className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-[0.2em] font-black italic">UNITS_DETECTED</span>
                        <span className="text-[11px] font-black uppercase digital-display">{(cls.class_enrollments as any)[0]?.count || 0}_CAPACITY</span>
                     </div>
                  </div>
               </div>

               <Link href={`/teacher/classes/${cls.id}/attendance`}>
                  <Button className="w-full h-12 bg-emerald-500/10 border border-emerald-500/30 text-foreground hover:bg-emerald-500 hover:text-bg-primary rounded-none font-black text-[10px] tracking-[0.4em] uppercase transition-all duration-700 font-heading italic shadow-inner relative overflow-hidden group/btn shadow-glow-emerald/10">
                     <div className="absolute inset-0 bg-emerald-500/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
                     <span className="relative z-10 flex items-center justify-center gap-3">
                        LAUNCH_SENSOR_ARRAY <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
                     </span>
                  </Button>
               </Link>
               
               <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/40 w-0 group-hover:w-full transition-all duration-1000"></div>
            </div>
          ))
        ) : (
          <div className="col-span-full workstation-panel bg-bg-secondary/40 border-dashed border-emerald-500/10 p-24 text-center opacity-40 italic flex flex-col items-center justify-center">
             <Search className="w-16 h-16 text-emerald-500/20 mx-auto mb-8 animate-pulse shadow-glow-emerald" />
             <p className="text-[11px] text-text-muted font-black uppercase tracking-[0.4em] italic mb-6">NO_ACTIVE_NODES_FOR_MONITORING // ไม่หน่วยการตรวจสอบ</p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 workstation-panel bg-bg-secondary border-emerald-500/10 flex items-center justify-between font-mono text-[9px] text-text-muted shrink-0">
           <div className="flex items-center gap-4">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse shadow-glow-emerald" />
              <span className="uppercase tracking-[0.3em] font-black italic">PRESENCE_LINK: SECURE</span>
           </div>
           <div className="opacity-30 uppercase tracking-[0.2em] font-black italic">
              ENGINE: SENSOR_WATCH_V2
           </div>
        </div>
    </div>
  )
}
