import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookMarked, ArrowRight, Clock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function GlobalStudentLessonsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all lessons from all classes the student is enrolled in
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes (
        name,
        class_code,
        lessons (*)
      )
    `)
    .eq('student_id', user.id)

  const lessons = enrollments?.flatMap(e => (e.classes as any)?.lessons.map((l: any) => ({
    ...l,
    className: (e.classes as any).name,
    classCode: (e.classes as any).class_code
  }))) || []

  // Sort by created_at descending
  lessons.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center">
          <span className="w-4 h-10 bg-indigo-500 mr-5"></span> 
          MY_KNOWLEDGE_FEED
        </h1>
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">
          Consolidated learning modules across all enrolled neural sectors
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson.id} className="bg-[#0e0e0e] border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
               <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(99,102,241,0.02),rgba(99,102,241,0.02)_1px,transparent_1px,transparent_10px)] pointer-events-none"></div>

               <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-4 mb-2">
                     <div className="bg-indigo-500/10 p-2 border border-indigo-500/20">
                        <BookMarked className="w-5 h-5 text-indigo-400" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{lesson.title}</h3>
                        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                           SECTOR: <span className="text-indigo-500">{lesson.className}</span> 
                           <span className="mx-2">|</span> 
                           TAG: {lesson.classCode}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="relative z-10 flex items-center gap-6">
                  <div className="hidden sm:block text-right">
                     <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">RECORDED_AT</p>
                     <p className="font-mono text-[10px] text-indigo-400 flex items-center gap-2 justify-end uppercase">
                        <Clock className="w-3 h-3" />
                        {new Date(lesson.created_at).toISOString().split('T')[0]}
                     </p>
                  </div>

                  <Link href={`/student/lessons/${lesson.id}`}>
                     <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest font-mono text-[10px] h-10 px-8 rounded-none">
                        RESUME_LEARNING <ArrowRight className="w-3 h-3 ml-2" />
                     </Button>
                  </Link>
               </div>
            </div>
          ))
        ) : (
          <div className="bg-[#0e0e0e] border border-dashed border-slate-800 p-20 text-center">
             <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">NO_MODULES_DETECTED_IN_FEED</p>
             <Link href="/student/classes" className="text-indigo-400 font-mono text-[10px] uppercase tracking-widest mt-4 inline-block hover:underline">
                Register for a class to begin ingestion
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}
