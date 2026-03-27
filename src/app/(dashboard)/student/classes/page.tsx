import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Hash, ArrowRight, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EnrollClassModal from '@/components/student/EnrollClassModal'
import LeaveClassButton from '@/components/student/LeaveClassButton'

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
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 selection:text-cyan-400 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-fuchsia-500">A/S</div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between relative z-10 gap-4 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center">
            <span className="w-3 h-8 bg-fuchsia-500 mr-4"></span>
            Active_Subscriptions
          </h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">{enrollments?.length || 0} SECTORS DETECTED_IN_CACHE</p>
        </div>
        <div className="flex items-center gap-3">
          <EnrollClassModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10 max-w-7xl mx-auto">
        {enrollments?.map((enr, i) => {
           const cls = enr.classes as any
           const teacher = cls.profiles
           
           // Deterministic aesthetic choices based on index purely for Cyberpunk variety
           const colors = [
             { border: 'hover:border-cyan-400',  accent: 'bg-cyan-400',  text: 'group-hover:text-cyan-400' },
             { border: 'hover:border-fuchsia-400', accent: 'bg-fuchsia-400', text: 'group-hover:text-fuchsia-400' },
             { border: 'hover:border-lime-400',  accent: 'bg-lime-400',  text: 'group-hover:text-lime-400' },
           ]
           const color = colors[i % colors.length]

           return (
            <div key={cls.id} className={`bg-[#1c1b1b] border border-slate-800 shadow-sm relative group ${color.border} transition-colors duration-300 flex flex-col`}>
              
              {/* Cyberpunk corner accent */}
              <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent ${color.border} transition-colors`}></div>

              <div className="p-6 flex-1">
                <div className="mb-4">
                    <h3 className={`font-sans font-black text-lg text-white uppercase tracking-tight ${color.text} transition-colors line-clamp-1`}>{cls.name}</h3>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2 line-clamp-2 leading-relaxed min-h-[30px]">{cls.description || 'NO_CONTEXT_PROVIDED_BY_ARCHITECT'}</p>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                    <UserCircle2 className="w-3 h-3 mr-3 text-slate-300" />
                    Architect: <span className="ml-2 text-white font-bold">{teacher?.full_name || 'UNKNOWN'}</span>
                  </div>
                  <div className="flex items-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                    <Hash className="w-3 h-3 mr-3 text-cyan-400" />
                    Code: <span className="ml-2 text-cyan-400 font-bold">{cls.class_code}</span>
                  </div>
                  <div className="flex items-center text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                    <Calendar className="w-3 h-3 mr-3 text-fuchsia-400" />
                    Term: <span className="ml-2">{cls.academic_year} / SEM_{cls.semester}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 p-4 bg-[#131313] flex gap-3">
                <Link href={`/student/classes/${cls.id}`} className="flex-1">
                  <Button className="w-full bg-[#2a2a2a] text-slate-300 hover:text-black rounded-none font-mono text-[10px] uppercase tracking-widest h-10 hover:bg-white transition-all group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    ENTER_NODE <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <LeaveClassButton classId={cls.id} />
              </div>
            </div>
           )
        })}

        {(!enrollments || enrollments.length === 0) && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border border-slate-800 bg-[#1c1b1b]/50 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_1px,transparent_1px,transparent_4px)] pointer-events-none z-0"></div>
            <span className="material-symbols-outlined text-4xl text-cyan-400 mb-4 animate-pulse relative z-10">cable</span>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed relative z-10">DISCONNECTED_STATE.<br/>USE [REQUEST_ACCESS] PROTOCOL ABOVE TO BIND TO A MASTER NODE.</p>
          </div>
        )}
      </div>

    </div>
  )
}
