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
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-500 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-heading text-[150px] leading-none select-none font-black text-emerald-500 italic opacity-10">NODE_DETAIL</div>
      </div>

      <div className="mb-6 relative z-10 w-full max-w-7xl mx-auto">
        <Link href="/teacher/classes" className="inline-flex items-center text-[10px] font-heading font-black uppercase tracking-[0.3em] text-slate-500 hover:text-emerald-500 transition-all mb-8 group italic">
          <ArrowLeft className="w-3 h-3 mr-3 group-hover:-translate-x-2 transition-transform" /> RETURN_TO_NEXUS
        </Link>
        
        <div className="bg-black/40 border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none"></div>
          <h1 className="text-4xl md:text-5xl font-heading font-black tracking-widest text-white uppercase italic glitch-text text-shadow-neon-cyan">
            {cls.name}
          </h1>
          <div className="flex flex-wrap gap-8 mt-6 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 italic">
            <span className="flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 mr-3 shadow-[0_0_8px_#10b981]"></span> NODE_CODE: <span className="text-emerald-500 font-black ml-3">{cls.class_code}</span></span>
            <span className="flex items-center"><span className="w-1.5 h-1.5 bg-white/20 mr-3"></span> TIMELINE: <span className="text-white ml-3">{cls.academic_year} // SEM_{cls.semester}</span></span>
            <span className="flex items-center hidden sm:flex"><span className="w-1.5 h-1.5 bg-white/20 mr-3"></span> SECTOR_ID: <span className="text-white ml-3">{cls.id.slice(0, 16).toUpperCase()}</span></span>
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
