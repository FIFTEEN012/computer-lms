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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-800 pb-4">
         <div>
            <h2 className="font-sans font-black text-2xl text-white uppercase tracking-widest flex items-center">
               <span className="w-2 h-6 bg-cyan-400 mr-3"></span> ACTIVE_MODULES
            </h2>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">{lessons?.length || 0} NODES DETECTED_IN_SEQUENCE</p>
         </div>
         
         <form action={handleCreate} className="flex gap-2 w-full sm:w-auto">
            <input 
               type="text" 
               name="title" 
               placeholder="NEW MODULE TITLE..." 
               required 
               className="bg-[#131313] border border-slate-800 h-10 px-4 text-xs font-mono text-cyan-400 uppercase tracking-widest focus:outline-none focus:border-cyan-400 flex-1 sm:w-64"
            />
            <Button type="submit" className="h-10 rounded-none bg-cyan-500 hover:bg-cyan-600 text-black font-bold uppercase tracking-widest font-mono text-[10px]">
               <Plus className="w-4 h-4 mr-2" /> CREATE
            </Button>
         </form>
      </div>

      <div className="bg-[#0e0e0e] border border-slate-800 p-6 relative shadow-xl">
         <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-cyan-400 font-mono text-6xl font-black">L/M</div>
         <div className="relative z-10">
            <LessonsListManager initialLessons={lessons || []} classId={params.classId} />
         </div>
      </div>
    </div>
  )
}
