import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, BrainCircuit, CalendarCheck, ShieldAlert, Award, Lock, Unlock, CheckCircle2 } from 'lucide-react'
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
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 selection:text-cyan-400 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-cyan-500">C/H</div>
      </div>

      <div className="mb-8 relative z-10 w-full max-w-7xl mx-auto space-y-6">
        
        <Link href="/student/classes" className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> TERMINATE_CONNECTION
        </Link>
        
        {/* Banner */}
        <div className="bg-[#1c1b1b] border-l-4 border-cyan-400 p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_1px,transparent_1px,transparent_4px)] pointer-events-none z-0"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase flex items-center mb-2">
              {cls.name}
            </h1>
            <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-400/10 inline-block px-3 py-1 mt-2">
               SUPERVISOR: {cls.profiles?.full_name || 'UNKNOWN'}
            </p>
            <p className="font-mono text-xs text-slate-500 mt-4 max-w-2xl leading-relaxed">
               {cls.description || 'Welcome to the operational node. Awaiting incoming directives...'}
            </p>
          </div>

          <div className="relative z-10 text-right w-full md:w-auto">
            <div className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-1 pl-1">COMPLETION_RATE //</div>
            <div className="text-4xl font-black text-white font-sans">{progressRatio}%</div>
            <div className="mt-2 h-1 w-full md:w-32 bg-[#353534] ml-auto">
                <div className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" style={{ width: `${progressRatio}%` }}></div>
            </div>
          </div>
        </div>

        {/* Triple Split Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content: Lessons */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1c1b1b] border border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                   <h2 className="font-sans font-black text-sm tracking-widest uppercase flex items-center text-white">
                      <span className="w-2 h-4 bg-fuchsia-400 mr-3"></span>
                      Sequenced_Directives <span className="text-slate-500 font-mono text-[10px] ml-3 hidden sm:inline">(LESSONS)</span>
                   </h2>
                   <BookOpen className="w-4 h-4 text-fuchsia-400 opacity-50" />
                </div>
                
                <div className="p-6">
                   {processedLessons.length > 0 ? (
                      <div className="space-y-4">
                         {processedLessons.map((lesson, idx) => (
                            <div key={lesson.id} className={`group border ${lesson.isUnlocked ? 'border-slate-800 bg-[#131313] hover:border-fuchsia-400 cursor-pointer' : 'border-slate-800/50 bg-[#0a0a0a] opacity-50 cursor-not-allowed'} p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors`}>
                               <div className="flex items-center gap-4">
                                  <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-none border border-slate-800 bg-black">
                                     {lesson.isCompleted ? <span className="text-lime-400 font-black">X</span> : lesson.isUnlocked ? <span className="text-fuchsia-400 font-black">+</span> : <span className="text-slate-600 font-black">-</span>}
                                  </div>
                                  <div>
                                     <div className={`font-mono text-[10px] uppercase tracking-widest mb-1 transition-colors ${lesson.isUnlocked ? 'text-slate-500 group-hover:text-fuchsia-400' : 'text-slate-700'}`}>MODULE_0{idx + 1}</div>
                                     <h3 className={`font-sans font-bold uppercase ${lesson.isUnlocked ? 'text-white' : 'text-slate-600'}`}>{lesson.title}</h3>
                                  </div>
                               </div>
                               
                               {lesson.isUnlocked ? (
                                  <Link href={`/student/lessons/${lesson.id}`} className="w-full sm:w-auto">
                                     <Button className="font-mono text-[10px] rounded-none bg-slate-800 text-white hover:bg-fuchsia-400 hover:text-black transition-colors uppercase tracking-widest border border-slate-700 w-full sm:w-auto">
                                        {lesson.isCompleted ? 'REVIEW' : 'EXECUTE'}
                                     </Button>
                                  </Link>
                               ) : (
                                  <Button disabled className="font-mono text-[10px] rounded-none bg-black text-slate-700 uppercase tracking-widest border border-slate-800 w-full sm:w-auto">
                                     LOCKED
                                  </Button>
                               )}
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-[#131313] text-center">
                         <ShieldAlert className="w-8 h-8 text-slate-600 mb-3" />
                         <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">NO_DIRECTIVES_DETECTED.<br/>ARCHITECT HAS NOT PUBLISHED MODULES.</span>
                      </div>
                   )}
                </div>
            </div>
          </div>

          {/* Sidebar: Quizzes & Stats */}
          <div className="space-y-6">
             {/* Quizzes */}
             <div className="bg-[#1c1b1b] border border-slate-800 shadow-sm">
                 <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                   <h2 className="font-sans font-black text-xs tracking-widest uppercase flex items-center text-white">
                      <span className="w-1.5 h-3 bg-lime-400 mr-2"></span>
                      Assessments
                   </h2>
                   <BrainCircuit className="w-4 h-4 text-lime-400 opacity-50" />
                 </div>
                 <div className="p-5">
                    {quizzes && quizzes.length > 0 ? (
                       <div className="space-y-4">
                          {quizzes.map((quiz) => (
                             <div key={quiz.id} className="bg-[#131313] border-l-2 border-lime-400 p-3 hover:bg-[#201f1f] transition-colors cursor-pointer group">
                                <div className="font-sans font-bold text-xs text-white uppercase group-hover:text-lime-400 transition-colors">{quiz.title}</div>
                                <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1">TIME_LIMIT: {quiz.time_limit_minutes || 'INIFINITE'} MIN</div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest text-center py-6 bg-[#131313] border border-slate-800">NO_ASSESSMENTS_ACTIVE</div>
                    )}
                 </div>
             </div>

             {/* Recent Activity / Attendance */}
             <div className="bg-[#1c1b1b] border border-slate-800 shadow-sm">
                 <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                   <h2 className="font-sans font-black text-xs tracking-widest uppercase flex items-center text-white">
                      <span className="w-1.5 h-3 bg-slate-400 mr-2"></span>
                      Connection_Logs
                   </h2>
                   <CalendarCheck className="w-4 h-4 text-slate-400 opacity-50" />
                 </div>
                 <div className="p-5">
                    <div className="space-y-3">
                       <div className="flex justify-between items-center font-mono text-[10px] uppercase border-b border-slate-800 pb-2">
                          <span className="text-slate-400">LAST_SYNC:</span>
                          <span className="text-cyan-400 font-bold">{new Date().toISOString().split('T')[0]}</span>
                       </div>
                       <div className="flex justify-between items-center font-mono text-[10px] uppercase">
                          <span className="text-slate-400">STATUS:</span>
                          <span className="text-lime-400 font-bold flex items-center">
                             <span className="w-1.5 h-1.5 bg-lime-400 rounded-full mr-2"></span> PRESENT
                          </span>
                       </div>
                       <Link href={`/student/classes/${params.classId}/attendance`}>
                         <div className="mt-4 py-2 text-center font-mono text-[9px] uppercase tracking-widest text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400 transition-colors cursor-pointer">VIEW_FULL_LOG →</div>
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
