import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Users, ArrowRight, ShieldAlert } from 'lucide-react'
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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center">
          <span className="w-4 h-10 bg-emerald-500 mr-5"></span> 
          ATTENDANCE_CONTROL_CENTER
        </h1>
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">
          Real-time presence monitoring across all department nodes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes && classes.length > 0 ? (
          classes.map((cls) => (
            <div key={cls.id} className="bg-[#0e0e0e] border border-slate-800 p-6 hover:border-emerald-500/50 transition-all group relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calendar className="w-12 h-12 text-emerald-500" />
               </div>
               
               <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">{cls.name}</h3>
               <div className="font-mono text-[10px] text-emerald-500 mb-6 uppercase tracking-widest">CODE: {cls.class_code}</div>
               
               <div className="flex items-center gap-4 mb-8">
                  <div className="flex items-center gap-2">
                     <Users className="w-4 h-4 text-slate-600" />
                     <span className="font-mono text-xs text-slate-400">{(cls.class_enrollments as any)[0]?.count || 0} ENROLLED</span>
                  </div>
               </div>

               <Link href={`/teacher/classes/${cls.id}/attendance`}>
                  <Button className="w-full bg-[#1c1b1b] border border-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-none font-mono text-[10px] tracking-widest uppercase transition-all">
                     LAUNCH_TRACKER <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
               </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[#0e0e0e] border border-dashed border-slate-800 p-20 text-center">
             <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">NO_ACTIVE_CLASSES_FOR_MONITORING</p>
          </div>
        )}
      </div>
    </div>
  )
}
