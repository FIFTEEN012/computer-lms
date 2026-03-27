import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ClassTabs from '@/components/teacher/ClassTabs'

export default async function ClassDetailLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { classId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: cls } = await supabase
    .from('classes')
    .select('*')
    .eq('id', params.classId)
    .single()

  if (!cls) redirect('/teacher/classes')

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-100 dark:bg-[#0e0e0e]/50 selection:bg-emerald-500/20 selection:text-emerald-500 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-emerald-500">N/D</div>
      </div>

      <div className="mb-6 relative z-10 w-full max-w-7xl mx-auto">
        <Link href="/teacher/classes" className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors mb-6 group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Return_To_Nexus
        </Link>
        
        <div className="bg-white dark:bg-[#1c1b1b] border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase flex items-center">
            <span className="w-3 h-8 bg-emerald-500 mr-4"></span>
            {cls.name}
          </h1>
          <div className="flex gap-6 mt-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
            <span className="flex items-center"><span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mr-2"></span> CODE: <span className="text-emerald-600 dark:text-emerald-500 font-bold ml-2">{cls.class_code}</span></span>
            <span className="flex items-center"><span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mr-2"></span> TERM: {cls.academic_year}_{cls.semester}</span>
            <span className="flex items-center hidden sm:flex"><span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mr-2"></span> IDENTIFIER_HASH: {cls.id.slice(0, 8)}</span>
          </div>
        </div>

        <ClassTabs classId={params.classId} />

        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
