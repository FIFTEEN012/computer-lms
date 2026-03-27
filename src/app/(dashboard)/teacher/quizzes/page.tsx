import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BrainCircuit, ExternalLink, Calendar, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function GlobalTeacherQuizzesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all quizzes from classes owned by this teacher
  // We join with classes and also use a subselect or separate join for attempts if needed
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      classes (
        name,
        class_code
      ),
      quiz_questions (count),
      quiz_attempts (count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center">
            <span className="w-4 h-10 bg-fuchsia-600 mr-5"></span> 
            GLOBAL_QUIZ_REPOSITORY
          </h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-2">
            Centralized intelligence assessment modules across active sectors
          </p>
        </div>
        <Link href="/teacher/classes">
          <Button className="bg-[#1c1b1b] border border-slate-800 text-fuchsia-400 hover:bg-slate-800 rounded-none font-mono text-[10px] tracking-widest uppercase">
            NEW_ASSESSMENT_UNIT
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => {
            const questionCount = (quiz.quiz_questions as any)[0]?.count || 0
            const attemptCount = (quiz.quiz_attempts as any)[0]?.count || 0

            return (
              <div key={quiz.id} className="bg-[#0e0e0e] border border-slate-800 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:border-fuchsia-500/50 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(217,70,239,0.02),rgba(217,70,239,0.02)_1px,transparent_1px,transparent_10px)] pointer-events-none"></div>

                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="bg-fuchsia-500/10 p-2 border border-fuchsia-500/20">
                      <BrainCircuit className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-fuchsia-400 transition-colors">{quiz.title}</h3>
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                         SEC: <span className="text-slate-300">{(quiz.classes as any)?.name}</span> 
                         <span className="mx-2">|</span> 
                         CODE: <span className="text-fuchsia-500">{(quiz.classes as any)?.class_code}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center md:text-left">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">QUESTIONS</p>
                    <p className="font-sans font-bold text-white text-sm">{questionCount}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">ATTEMPTS</p>
                    <p className="font-sans font-bold text-white text-sm">{attemptCount}</p>
                  </div>
                  <div className="text-center md:text-left">
                     <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">STATUS</p>
                     <p className={`font-mono text-[10px] uppercase font-bold ${quiz.is_published ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {quiz.is_published ? 'ACTIVE' : 'DRAFT'}
                     </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
                       <Button variant="outline" className="border-slate-800 rounded-none h-10 px-4 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                       </Button>
                    </Link>
                    <Link href={`/teacher/quizzes/${quiz.id}/results`}>
                       <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black uppercase tracking-widest font-mono text-[10px] h-10 px-4 rounded-none">
                          <BarChart3 className="w-4 h-4" />
                       </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-[#0e0e0e] border border-dashed border-slate-800 p-20 text-center">
             <BrainCircuit className="w-12 h-12 text-slate-700 mx-auto mb-4" />
             <p className="font-mono text-sm text-slate-500 uppercase tracking-widest">NO_COGNITIVE_TESTS_FOUND</p>
          </div>
        )}
      </div>
    </div>
  )
}
