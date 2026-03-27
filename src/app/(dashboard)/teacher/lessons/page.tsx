import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ExternalLink, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeleteLessonButton } from '@/components/teacher/lessons/DeleteLessonButton'

export const dynamic = 'force-dynamic'

export default async function GlobalTeacherLessonsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all lessons from all classes owned by this teacher
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select(`
      *,
      classes (
        name,
        class_code
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center">
            <span className="w-4 h-10 bg-cyan-400 mr-5"></span> 
            GLOBAL_LESSON_MANIFEST
          </h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">
            Consolidated repository of all instructional modules across active clusters
          </p>
        </div>
        <Link href="/teacher/classes">
          <Button className="bg-[#1c1b1b] border border-slate-800 text-cyan-400 hover:bg-slate-800 rounded-none font-mono text-[10px] tracking-widest uppercase">
            <Plus className="w-4 h-4 mr-2" /> CREATE_VIA_CLASS
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson.id} className="bg-[#0e0e0e] border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-cyan-400/50 transition-all group relative overflow-hidden">
               <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,255,255,0.02),rgba(0,255,255,0.02)_1px,transparent_1px,transparent_10px)] pointer-events-none"></div>
               
               <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="bg-cyan-500/10 p-2 border border-cyan-500/20">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-cyan-400 transition-colors uppercase">{lesson.title}</h3>
                        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                           CLASS: <span className="text-slate-300">{(lesson.classes as any)?.name}</span> 
                           <span className="mx-2">|</span> 
                           CODE: <span className="text-cyan-500">{(lesson.classes as any)?.class_code}</span>
                        </p>
                     </div>
                  </div>
               </div>

                <div className="relative z-10 flex items-center gap-4">
                   <div className="hidden lg:block text-right">
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">DEPLOYED_ON</p>
                      <p className="font-mono text-[10px] text-white flex items-center gap-2 justify-end">
                         <Calendar className="w-3 h-3 text-slate-600" />
                         {new Date(lesson.created_at).toISOString().split('T')[0]}
                      </p>
                   </div>

                   <div className="flex items-center gap-2">
                      <Link href={`/teacher/lessons/${lesson.id}/edit`}>
                         <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-black uppercase tracking-widest font-mono text-[10px] h-10 px-6 rounded-none">
                            ENTER_EDITOR <ExternalLink className="w-3 h-3 ml-2" />
                         </Button>
                      </Link>

                      <DeleteLessonButton 
                         lessonId={lesson.id} 
                         classId={lesson.class_id} 
                         lessonTitle={lesson.title} 
                      />
                   </div>
                </div>
            </div>
          ))
        ) : (
          <div className="bg-[#0e0e0e] border border-dashed border-slate-800 p-20 text-center">
             <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">NO_LESSONS_FOUND_IN_DATABANKS</p>
             <Link href="/teacher/classes" className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest mt-4 inline-block hover:underline">
                Initialize a class to begin authoring
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}
