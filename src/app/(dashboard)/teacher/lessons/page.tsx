import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ExternalLink, Calendar, Plus, Activity, Search } from 'lucide-react'
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
    <div className="p-4 md:p-6 h-full flex flex-col relative font-body text-text-main selection:bg-accent-primary/20 selection:text-accent-primary overflow-hidden italic scanlines bg-bg-primary">
      <div className="absolute inset-0 bg-accent-primary/2 opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-20 right-10 p-4 opacity-[0.02] pointer-events-none z-0">
        <div className="font-heading text-[54px] leading-none select-none font-black text-accent-primary/10 italic tracking-tighter uppercase">KNOWLEDGE_BASE</div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6 max-w-7xl mx-auto font-heading border-l-4 border-accent-primary pl-6 py-3 workstation-panel !bg-transparent !border-r-0 !border-y-0 relative group">
        <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] text-foreground uppercase italic glitch-text neon-glaze leading-tight" data-text="คลังบทเรียนทั้งหมด">
            คลังบทเรียนทั้งหมด // LESSON_HUB
          </h1>
          <p className="text-[10px] text-accent-primary font-black uppercase tracking-[0.4em] mt-3 flex items-center italic border-l-2 border-accent-primary/20 pl-6 not-italic">
             <span className="w-2 h-2 bg-accent-primary mr-3 animate-ping rounded-full shadow-glow-cyan"></span>
             DETECTED_{lessons?.length || 0}_ACTIVE_MODULES // SYNC_OK
          </p>
        </div>
        <Link href="/teacher/classes">
          <Button className="font-heading text-[10px] font-black tracking-[0.3em] uppercase rounded-none h-11 px-8 shadow-glow-cyan transition-all hover:scale-[1.05] active:scale-95 bg-bg-secondary text-accent-primary border border-accent-primary/20 hover:border-accent-primary italic">
            <Plus className="w-4 h-4 mr-3" /> สร้างผ่านคลาสเรียน
          </Button>
        </Link>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4 relative z-10 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar pr-2 pb-6">
        {lessons && lessons.length > 0 ? (
          lessons.map((lesson, i) => (
            <div key={lesson.id} className="workstation-panel bg-bg-secondary/40 border border-accent-primary/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-accent-primary/40 transition-all duration-700 group relative overflow-hidden shadow-2xl backdrop-blur-3xl hover:scale-[1.01] cursor-default h-fit">
               <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-heading text-4xl italic font-black group-hover:opacity-10 transition-opacity text-foreground">MODULE_0{i+1}</div>
               <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent"></div>
               
               <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-6">
                     <div className="bg-bg-primary/50 p-4 border border-accent-primary/20 group-hover:border-accent-primary transition-all shadow-glow-cyan clip-path-diag">
                        <BookOpen className="w-6 h-6 text-accent-primary group-hover:scale-110 transition-transform" />
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-[0.1em] group-hover:text-accent-primary transition-all truncate italic leading-tight font-body shadow-glow-cyan" data-text={lesson.title.toUpperCase()}>{lesson.title}</h3>
                        <div className="font-heading text-[10px] text-text-muted font-black uppercase tracking-[0.3em] flex items-center gap-x-4 mt-2 italic">
                           <span>รายวิชา: <span className="text-foreground">{(lesson.classes as any)?.name}</span></span> 
                           <span className="opacity-20">|</span> 
                           <span>ID: <span className="text-accent-primary digital-display">{(lesson.classes as any)?.class_code}</span></span>
                        </div>
                     </div>
                  </div>
               </div>

                <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                   <div className="hidden lg:block text-right pr-6 border-r border-accent-primary/10">
                      <p className="font-heading text-[9px] text-text-muted font-black uppercase tracking-[0.3em] mb-1 italic">INGESTED_ON</p>
                      <p className="font-heading text-[11px] text-accent-primary flex items-center gap-2 justify-end font-black digital-display italic">
                         <Calendar className="w-3 h-3 text-accent-primary/40" />
                         {new Date(lesson.created_at).toISOString().split('T')[0]}
                      </p>
                   </div>

                   <div className="flex items-center gap-4 flex-1 md:flex-initial">
                      <Link href={`/teacher/lessons/${lesson.id}/edit`} className="flex-1 md:flex-initial">
                         <Button className="w-full h-12 bg-accent-primary text-bg-primary hover:bg-accent-primary/90 font-black uppercase tracking-[0.3em] font-heading text-[10px] px-8 rounded-none transition-all duration-500 italic shadow-glow-cyan border-none">
                            แก้ไขเนื้อหา <ExternalLink className="w-4 h-4 ml-3" />
                         </Button>
                      </Link>

                      <DeleteLessonButton 
                         lessonId={lesson.id} 
                         classId={lesson.class_id} 
                         lessonTitle={lesson.title} 
                      />
                   </div>
                </div>
                
                <div className="absolute bottom-0 left-0 h-0.5 bg-accent-primary/40 w-0 group-hover:w-full transition-all duration-1000"></div>
            </div>
          ))
        ) : (
          <div className="workstation-panel bg-bg-secondary/40 border-dashed border-accent-primary/10 p-24 text-center opacity-40 italic flex flex-col items-center justify-center">
             <Search className="w-16 h-16 text-accent-primary/20 mb-6 animate-pulse" />
             <p className="font-heading text-[11px] text-text-muted font-black uppercase tracking-[0.4em] italic mb-6">NO_MODULES_DETECTED_IN_SECTOR // ไม่พบข้อมูลบทเรียน</p>
             <Link href="/teacher/classes">
                <Button className="h-12 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary hover:bg-accent-primary hover:text-bg-primary font-black text-[10px] tracking-[0.4em] uppercase transition-all duration-700 px-10 italic !rounded-none">
                   INITIALIZE_FIRST_NODE
                </Button>
             </Link>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 workstation-panel bg-bg-secondary border-accent-primary/10 flex items-center justify-between font-mono text-[9px] text-text-muted shrink-0">
           <div className="flex items-center gap-4">
              <Activity className="w-3 h-3 text-accent-primary animate-pulse" />
              <span className="uppercase tracking-[0.3em] font-black italic">DATA_FLOW: NOMINAL</span>
           </div>
           <div className="opacity-30 uppercase tracking-[0.2em] font-black italic">
              UNIT: LESSON_CONTROLLER_V3
           </div>
        </div>
    </div>
  )
}
