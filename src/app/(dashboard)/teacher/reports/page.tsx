import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, ArrowRight, ShieldAlert, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function GlobalTeacherReportsPage() {
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
    <div className="p-8 md:p-12 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto font-body italic relative overflow-hidden">
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0"></div>
      
      <div className="relative z-10 font-heading">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest italic flex items-center drop-shadow-glow-cyan">
          <span className="w-1.5 h-12 md:h-16 bg-amber-500 mr-6 shadow-glow-amber animate-pulse" />
          ANALYTICS_COMMAND_DECK
        </h1>
        <p className="text-[11px] text-slate-600 font-black uppercase tracking-[0.3em] mt-5 max-w-2xl leading-relaxed border-l-2 border-white/5 pl-6 not-italic">
          Comprehensive performance vectors and department-wide reporting. Real-time diagnostic data streams synchronized from all active educational nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {classes && classes.length > 0 ? (
          classes.map((cls) => (
            <div key={cls.id} className="bg-black/60 border border-white/5 p-8 hover:border-amber-500 transition-all duration-500 group relative overflow-hidden shadow-2xl backdrop-blur-3xl font-heading">
               <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:-translate-y-2 group-hover:translate-x-2">
                  <TrendingUp className="w-16 h-16 text-amber-500" />
               </div>
               
               <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3 glitch-text">{cls.name}</h3>
               <div className="text-[10px] text-amber-500 mb-8 uppercase tracking-[0.3em] font-black border-l border-amber-500/30 pl-3">DATASET_ID: ROSTER_{cls.id.slice(0, 8)}</div>
               
               <div className="flex items-center gap-6 mb-10">
                  <div className="flex items-center gap-3">
                     <LayoutDashboard className="w-4 h-4 text-slate-700 group-hover:text-amber-500 transition-colors" />
                     <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">METRIC_SYNC: ACTIVE</span>
                  </div>
               </div>

               <Link href={`/teacher/classes/${cls.id}/reports`}>
                  <Button className="w-full h-12 bg-white/5 border border-white/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black rounded-none font-black text-[10px] tracking-[0.4em] uppercase transition-all duration-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]">
                     EXECUTE_ANALYTICS <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </Link>
               
               <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 group-hover:w-full transition-all duration-700"></div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-black/40 border border-dashed border-white/10 p-24 text-center shadow-inner font-heading">
             <ShieldAlert className="w-16 h-16 text-slate-800 mx-auto mb-6 animate-pulse" />
             <p className="text-[11px] text-slate-700 font-black uppercase tracking-[0.4em]">NO_REPORTING_DATA_FOUND_IN_NODE</p>
          </div>
        )}
      </div>
    </div>
  )
}
