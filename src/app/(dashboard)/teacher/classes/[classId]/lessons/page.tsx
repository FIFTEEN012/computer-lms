import { createClient } from '@/lib/supabase/server'
import LessonsListManager from '@/components/teacher/lessons/LessonsListManager'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createLessonAction } from '@/app/actions/lessons'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TeacherClassLessonsPage({ params }: { params: { classId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lessons } = await supabase
     .from('lessons')
     .select('*')
     .eq('class_id', params.classId)
     .order('lesson_order')
  
  // We use form action server hook to instantly generate a blank lesson and redirect to editor
  const handleCreate = async (formData: FormData) => {
    "use server"
    const title = formData.get('title') as string
    if (!title) return
    const res = await createLessonAction(params.classId, title)
    if (res?.success && res.lesson) {
      redirect(`/teacher/lessons/${res.lesson.id}/edit`)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 relative z-10 italic">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-white/5 pb-8">
         <div className="font-heading">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest flex items-center italic glitch-text text-shadow-neon-cyan">
               <span className="w-2.5 h-8 bg-cyan-400 mr-4 shadow-glow-cyan animate-pulse"></span> ACTIVE_MODULES
            </h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mt-4 flex items-center">
               // {lessons?.length || 0} SECTOR_NODES_ALLOCATED_IN_SEQUENCE
            </p>
         </div>
         
         <form action={handleCreate} className="flex gap-4 w-full sm:w-auto font-heading">
            <input 
               type="text" 
               name="title" 
               placeholder="IDENTIFY_NEW_MODULE..." 
               required 
               className="bg-white/[0.03] border border-white/10 h-12 px-5 text-[10px] text-cyan-400 uppercase tracking-[0.3em] font-black focus:outline-none focus:border-cyan-400 flex-1 sm:w-80 group hover:bg-white/[0.05] transition-all"
            />
            <Button type="submit" className="h-12 px-8 rounded-none bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white transition-all shadow-glow-cyan border-none italic group">
               <Plus className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" /> INITIALIZE
            </Button>
         </form>
      </div>

      <div className="bg-black/40 border border-white/5 p-10 relative shadow-2xl overflow-hidden group">
         <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
         <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-white font-heading text-8xl font-black italic">LM_MODULE</div>
         <div className="relative z-10">
            <LessonsListManager initialLessons={lessons || []} classId={params.classId} />
         </div>
         <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-1000 shadow-glow-cyan"></div>
      </div>
    </div>
  )
}
