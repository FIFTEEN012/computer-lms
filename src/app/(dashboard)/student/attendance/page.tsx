import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, ArrowRight, ShieldAlert, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function GlobalStudentAttendancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all classes the student is enrolled in
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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center">
          <span className="w-4 h-10 bg-emerald-500 mr-5"></span> 
          PRESENCE_LOG_OVERVIEW
        </h1>
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">
          Historical attendance tracing across all active neural clusters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments && enrollments.length > 0 ? (
          enrollments.map((enr) => (
            <div key={enr.class_id} className="bg-[#0e0e0e] border border-slate-800 p-6 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calendar className="w-12 h-12 text-emerald-500" />
               </div>
               
               <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">{(enr.classes as any)?.name}</h3>
               <div className="font-mono text-[10px] text-emerald-500 mb-8 uppercase tracking-widest">TAG: {(enr.classes as any)?.class_code}</div>
               
               <Link href={`/student/classes/${enr.class_id}/attendance`}>
                  <Button className="w-full bg-[#1c1b1b] border border-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-none font-mono text-[10px] tracking-widest uppercase transition-all">
                     VIEW_FULL_LOG <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
               </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[#0e0e0e] border border-dashed border-slate-800 p-20 text-center">
             <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">NO_ATTENDANCE_STREAMS_DETECTED</p>
          </div>
        )}
      </div>
    </div>
  )
}
