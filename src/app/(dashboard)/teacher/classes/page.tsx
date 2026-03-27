import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, MoreVertical, Copy, Settings, Trash2, Calendar, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CreateClassModal from '@/components/teacher/CreateClassModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: classes } = await supabase
    .from('classes')
    .select('*, class_enrollments(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-100 dark:bg-[#0e0e0e]/50 selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-blue-500">C/M</div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between relative z-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center">
            <span className="w-3 h-8 bg-blue-500 mr-4"></span>
            Course_Management
          </h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">{classes?.length || 0} ACTIVE_NODES DETECTED</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateClassModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        {classes?.map((cls) => (
          <div key={cls.id} className="bg-white dark:bg-[#1c1b1b] border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-blue-500 dark:hover:border-blue-500 transition-colors duration-300 flex flex-col">
            
            {/* Cyberpunk corner accent */}
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-transparent group-hover:border-blue-500 transition-colors"></div>

            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-sans font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{cls.name}</h3>
                  <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-1 line-clamp-1">{cls.description || 'NO_DESCRIPTION_PROVIDED'}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white dark:bg-[#131313] border-slate-200 dark:border-slate-800 rounded-none font-mono text-xs uppercase tracking-widest shadow-xl">
                    <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-[#201f1f] focus:text-slate-900 dark:focus:text-white cursor-pointer transition-colors border-l-2 border-transparent focus:border-blue-500">
                      <Settings className="w-3 h-3 mr-2" /> Modify_Parameters
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer transition-colors border-l-2 border-transparent focus:border-red-500 mt-1">
                      <Trash2 className="w-3 h-3 mr-2" /> Terminate_Node
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                  <Hash className="w-3 h-3 mr-3 text-primary" />
                  Code: <span className="ml-2 text-primary font-bold">{cls.class_code}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                  <Calendar className="w-3 h-3 mr-3 text-emerald-500" />
                  Term: <span className="ml-2">{cls.academic_year} / SEM_{cls.semester}</span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-widest">
                  <Users className="w-3 h-3 mr-3 text-pink-500" />
                  Load: <span className="ml-2">{cls.class_enrollments[0]?.count || 0} LEARNERS</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-[#131313] flex gap-3">
              <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
                <Button className="w-full rounded-none font-mono text-[10px] uppercase tracking-widest h-8 shadow-[0_0_10px_rgba(var(--primary),0.1)] hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all">
                  Access_Terminal
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="group rounded-none h-8 w-8 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-[#201f1f] transition-colors" title="Copy Class Code">
                <Copy className="w-3 h-3 text-slate-500 group-hover:text-primary transition-colors" />
              </Button>
            </div>
          </div>
        ))}

        {(!classes || classes.length === 0) && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#1c1b1b]/50 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-4 animate-pulse">memory</span>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">NO_ACTIVE_COURSES_DETECTED<br/>INITIALIZE_FIRST_NODE_TO_BEGIN</p>
          </div>
        )}
      </div>

    </div>
  )
}
