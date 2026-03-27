import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckSquare, ArrowRight, Zap, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function GlobalStudentQuizzesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all quizzes from all classes the student is enrolled in
  // We join class_enrollments -> classes -> quizzes
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id,
      classes (
        name,
        class_code,
        quizzes (*)
      )
    `)
    .eq('student_id', user.id)

  const quizzes = enrollments?.flatMap(e => (e.classes as any)?.quizzes.map((q: any) => ({
    ...q,
    className: (e.classes as any).name,
    classCode: (e.classes as any).class_code
  }))).filter(q => q.is_published) || []

  // Sort by created_at descending
  quizzes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center">
          <span className="w-4 h-10 bg-orange-500 mr-5"></span> 
          COGNITIVE_CHALLENGES
        </h1>
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">
          Active assessment streams across your neural network
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-[#0e0e0e] border border-slate-800 p-6 hover:border-orange-500/50 transition-all group relative overflow-hidden">
               <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(249,115,22,0.02),rgba(249,115,22,0.02)_1px,transparent_1px,transparent_10px)] pointer-events-none"></div>
               
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-orange-500/10 p-2 border border-orange-500/20">
                        <CheckSquare className="w-5 h-5 text-orange-400" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors uppercase line-clamp-1">{quiz.title}</h3>
                        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">{quiz.className}</p>
                     </div>
                  </div>

                  <div className="space-y-4 mb-8 flex-1">
                     <div className="flex justify-between items-center bg-[#131313] p-3 border border-slate-800/50">
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">TIME_LIMIT</span>
                        <span className="font-mono text-[10px] text-white uppercase tracking-widest">{quiz.time_limit} MINS</span>
                     </div>
                     <div className="flex justify-between items-center bg-[#131313] p-3 border border-slate-800/50">
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">THRESHOLD</span>
                        <span className="font-mono text-[10px] text-orange-400 uppercase tracking-widest">{quiz.passing_score}% ACCURACY</span>
                     </div>
                  </div>

                  <Link href={`/student/quizzes/${quiz.id}`}>
                     <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest font-mono text-[10px] h-10 rounded-none">
                        START_ASSESSMENT <Zap className="w-3 h-3 ml-2" />
                     </Button>
                  </Link>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[#0e0e0e] border border-dashed border-slate-800 p-20 text-center">
             <ShieldAlert className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">NO_COGNITIVE_CHALLENGES_AVAILABLE</p>
          </div>
        )}
      </div>
    </div>
  )
}
