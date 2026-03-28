import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, BrainCircuit, CalendarCheck, ShieldAlert, Award, Lock, Unlock, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function StudentClassHome({ params }: { params: { classId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Prevent illegal access - MUST be enrolled
  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('class_id')
    .eq('student_id', user.id)
    .eq('class_id', params.classId)
    .single()

  if (!enrollment) redirect('/student/classes')

  const { data: cls } = await supabase
    .from('classes')
    .select('*, profiles!classes_teacher_id_fkey(full_name)')
    .eq('id', params.classId)
    .single()

  // Fetch actual data where applicable
  const { data: lessons } = await supabase.from('lessons').select('*').eq('class_id', params.classId).eq('is_published', true).order('lesson_order')
  const { data: quizzes } = await supabase.from('quizzes').select('*').eq('class_id', params.classId).order('created_at', { ascending: false })

  const { data: progress } = await supabase.from('lesson_progress').select('*').eq('student_id', user.id).in('lesson_id', (lessons || []).map(l => l.id))
  
  const progressMap = new Map((progress || []).map(p => [p.lesson_id, p]))

  let previousCompleted = true // First published lesson is always unlocked by default
  const processedLessons = (lessons || []).map(lesson => {
    const p = progressMap.get(lesson.id)
    const isCompleted = !!p?.completed_at
    const isUnlocked = previousCompleted
    previousCompleted = isCompleted // Next lesson is unlocked ONLY if THIS lesson completes
    return { ...lesson, progress: p, isUnlocked, isCompleted }
  })

  const completedCount = processedLessons.filter(l => l.isCompleted).length
  const progressRatio = processedLessons.length > 0 ? Math.round((completedCount / processedLessons.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 selection:bg-cyan-400/20 selection:text-cyan-400 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-heading text-[150px] leading-none select-none font-black text-cyan-500 italic opacity-10">OPERATIONAL_NODE</div>
      </div>

      <div className="mb-8 relative z-10 w-full max-w-7xl mx-auto space-y-8">
        
        <Link href="/student/classes" className="inline-flex items-center text-[10px] font-heading font-black uppercase tracking-[0.3em] text-slate-500 hover:text-cyan-400 transition-all group italic">
          <ArrowLeft className="w-3 h-3 mr-3 group-hover:-translate-x-2 transition-transform" /> TERMINATE_CONNECTION
        </Link>
        
        {/* Banner */}
        <div className="bg-black/60 border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-8 group">
          <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-heading font-black tracking-widest text-white uppercase italic glitch-text text-shadow-neon-cyan mb-4">
              {cls.name}
            </h1>
            <div className="flex flex-wrap gap-4 mt-6 font-heading font-black italic">
               <span className="font-heading text-[10px] text-cyan-400 uppercase tracking-[0.2em] bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 flex items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-500 mr-3 animate-pulse"></span>
                  SUPERVISOR: {cls.profiles?.full_name?.toUpperCase() || 'UNKNOWN_ARCHITECT'}
               </span>
               <span className="font-heading text-[10px] text-fuchsia-400 uppercase tracking-[0.2em] bg-fuchsia-400/10 border border-fuchsia-400/20 px-4 py-1.5 flex items-center">
                  NODE_ID: {cls.id.slice(0, 8).toUpperCase()}
               </span>
            </div>
            <p className="font-body text-xs text-slate-400 mt-8 max-w-2xl leading-relaxed italic font-bold">
               {cls.description || '// Welcome to the operational node. Awaiting incoming directives from the Central command.'}
            </p>
          </div>

          <div className="relative z-10 text-right w-full md:w-64 bg-black/40 border border-white/5 p-6 backdrop-blur-md">
            <div className="font-heading text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-3 font-black italic flex justify-between">
               <span>COMPLETION_RATE</span>
               <span className="text-cyan-400">{progressRatio}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 relative overflow-hidden">
                <div className="h-full bg-cyan-400 shadow-[0_0_15px_#00f3ff] transition-all duration-1000 ease-out" style={{ width: `${progressRatio}%` }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            </div>
            <div className="mt-4 font-heading text-[9px] text-slate-500 uppercase tracking-widest italic font-bold">
               {completedCount} / {processedLessons.length} MODULES_SYNCED
            </div>
          </div>
        </div>

        {/* Triple Split Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Lessons */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-black/40 border border-white/5 shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none"></div>
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                   <h2 className="font-heading font-black text-sm tracking-[0.2em] uppercase flex items-center text-white italic">
                      <span className="w-2.5 h-5 bg-fuchsia-500 mr-4 shadow-[0_0_10px_#ff00ff]"></span>
                      Sequenced_Directives <span className="text-slate-600 font-bold text-[10px] ml-4 hidden sm:inline">// SECTOR_LESSONS</span>
                   </h2>
                   <BookOpen className="w-5 h-5 text-fuchsia-400 opacity-50 group-hover:rotate-12 transition-transform" />
                </div>
                
                <div className="p-8">
                   {processedLessons.length > 0 ? (
                      <div className="space-y-6">
                         {processedLessons.map((lesson, idx) => (
                            <div key={lesson.id} className={`group relative border transition-all duration-500 ${lesson.isUnlocked ? 'border-white/5 bg-white/[0.02] hover:border-fuchsia-500/50 hover:bg-white/[0.05] cursor-pointer' : 'border-white/2 bg-black opacity-40 cursor-not-allowed'}`}>
                               <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
                                 <div className="flex items-center gap-6">
                                    <div className={`flex items-center justify-center w-10 h-10 border transition-all duration-500 ${lesson.isCompleted ? 'border-lime-500/50 text-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.2)]' : lesson.isUnlocked ? 'border-fuchsia-500/50 text-fuchsia-400' : 'border-white/5 text-slate-700'}`}>
                                       {lesson.isCompleted ? <span className="font-heading font-black italic">CL</span> : <span className="font-heading font-black italic">{idx + 1}</span>}
                                    </div>
                                    <div>
                                       <div className={`font-heading text-[9px] uppercase tracking-[0.3em] mb-2 transition-colors font-black italic ${lesson.isUnlocked ? 'text-slate-500 group-hover:text-fuchsia-400' : 'text-slate-800'}`}>MODULE_0{idx + 1} // ID_PRTCL</div>
                                       <h3 className={`text-lg font-heading font-black tracking-widest uppercase italic transition-colors ${lesson.isUnlocked ? 'text-white' : 'text-slate-700'}`}>{lesson.title}</h3>
                                    </div>
                                 </div>
                                 
                                 {lesson.isUnlocked ? (
                                    <Link href={`/student/lessons/${lesson.id}`} className="w-full sm:w-auto">
                                       <Button className="font-heading text-[10px] font-black rounded-none bg-white text-black hover:bg-fuchsia-500 hover:text-white transition-all uppercase tracking-[0.2em] w-full sm:w-48 h-12 italic border-none group/lesson shadow-lg">
                                          {lesson.isCompleted ? 'REVIEW_ARCHIVE' : 'EXECUTE_SYNC'} <ArrowRight className="w-3.5 h-3.5 ml-3 group-hover/lesson:translate-x-2 transition-transform" />
                                       </Button>
                                    </Link>
                                 ) : (
                                    <div className="flex items-center gap-3 font-heading text-[10px] font-black uppercase tracking-widest text-slate-700 italic pr-4">
                                       <Lock className="w-3.5 h-3.5" /> ENCRYPTED
                                    </div>
                                 )}
                               </div>
                               {/* Hover glow effect for unlocked */}
                               {lesson.isUnlocked && (
                                 <div className={`absolute bottom-0 left-0 h-[2px] bg-fuchsia-500 w-0 group-hover:w-full transition-all duration-700 shadow-[0_0_10px_#ff00ff]`}></div>
                               )}
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="py-24 flex flex-col items-center justify-center border border-white/5 bg-black/40 text-center relative overflow-hidden group">
                         <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none"></div>
                         <ShieldAlert className="w-12 h-12 text-slate-700 mb-6 group-hover:scale-110 transition-transform duration-500 animate-pulse" />
                         <span className="font-heading text-[11px] uppercase tracking-[0.4em] text-slate-600 font-black italic">
                            // NO_DIRECTIVES_DETECTED_IN_THIS_SECTOR<br/>
                            ARCHITECT HAS NOT PUBLISHED MODULES.
                         </span>
                      </div>
                   )}
                </div>
            </div>
          </div>

          {/* Sidebar: Quizzes & Stats */}
          <div className="space-y-8">
             {/* Quizzes */}
             <div className="bg-black/40 border border-white/5 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none"></div>
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                   <h2 className="font-heading font-black text-xs tracking-[0.2em] uppercase flex items-center text-white italic">
                      <span className="w-2 h-4 bg-lime-500 mr-3 shadow-[0_0_8px_#84cc16]"></span>
                      Assessments
                   </h2>
                   <BrainCircuit className="w-4 h-4 text-lime-400 opacity-50 group-hover:animate-pulse transition-all" />
                 </div>
                 <div className="p-6">
                    {quizzes && quizzes.length > 0 ? (
                       <div className="space-y-4">
                          {quizzes.map((quiz) => (
                             <div key={quiz.id} className="bg-black/40 border border-white/5 p-5 hover:bg-lime-500 hover:border-transparent transition-all cursor-pointer group/quiz relative overflow-hidden">
                                <div className="absolute inset-0 bg-lime-500 opacity-0 group-hover/quiz:opacity-10 transition-opacity"></div>
                                <div className="font-heading font-black text-sm text-white uppercase group-hover/quiz:text-black transition-colors mb-2 italic tracking-wider">{quiz.title}</div>
                                <div className="font-heading text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold italic group-hover/quiz:text-black/70 transition-colors">
                                  TIME_LIMIT: {quiz.time_limit_minutes ? `${quiz.time_limit_minutes}_MINUTES` : 'UNRESTRICTED'}
                                </div>
                                <div className="absolute right-4 bottom-4 opacity-0 group-hover/quiz:opacity-100 transition-all group-hover/quiz:translate-x-0 translate-x-4">
                                   <ArrowRight className="w-4 h-4 text-black" />
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="font-heading text-[9px] text-slate-600 uppercase tracking-[0.3em] font-black text-center py-10 bg-black/40 border border-white/5 italic">
                          // NO_ACTV_ASSSM_PRTCL
                       </div>
                    )}
                 </div>
             </div>

             {/* Recent Activity / Attendance */}
             <div className="bg-black/40 border border-white/5 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none"></div>
                 <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                   <h2 className="font-heading font-black text-xs tracking-[0.2em] uppercase flex items-center text-white italic">
                      <span className="w-2 h-4 bg-white/20 mr-3"></span>
                      Connection_Logs
                   </h2>
                   <CalendarCheck className="w-4 h-4 text-slate-500 opacity-50" />
                 </div>
                 <div className="p-6">
                    <div className="space-y-4 bg-black/20 p-5 border border-white/5">
                       <div className="flex justify-between items-center font-heading text-[10px] uppercase font-bold italic border-b border-white/5 pb-3">
                          <span className="text-slate-500 tracking-widest">LAST_SYNC:</span>
                          <span className="text-cyan-400 font-black tracking-widest">{new Date().toISOString().split('T')[0].toUpperCase()}</span>
                       </div>
                       <div className="flex justify-between items-center font-heading text-[10px] uppercase font-bold italic pt-1">
                          <span className="text-slate-500 tracking-widest">STATUS:</span>
                          <span className="text-lime-400 font-black flex items-center tracking-widest shadow-glow-lime">
                             <span className="w-2 h-2 bg-lime-500 rounded-full mr-3 animate-[pulse_1s_infinite]"></span> PRESENT
                          </span>
                       </div>
                       <Link href={`/student/classes/${params.classId}/attendance`}>
                         <div className="mt-8 py-3 text-center font-heading text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400 hover:text-black transition-all cursor-pointer italic">
                           VIEW_FULL_LOG_MANIFEST →
                         </div>
                       </Link>
                    </div>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
