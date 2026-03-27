"use client"

import { useState } from 'react'
import { Plus, BrainCircuit, Users, Target, Clock, AlertCircle, Edit, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { updateQuizAction } from '@/app/actions/quiz'
import { useToast } from '@/hooks/useToast'
import CreateQuizModal from '@/components/teacher/quizzes/CreateQuizModal'

export default function QuizListClient({ classId, initialQuizzes }: { classId: string, initialQuizzes: any[] }) {
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    setUpdatingId(quizId)
    const newStatus = !currentStatus
    const res = await updateQuizAction(quizId, classId, { is_published: newStatus })
    setUpdatingId(null)
    
    if (res?.error) {
       toast({ title: "TOGGLE_FAILURE", description: res.error, variant: "destructive" })
    } else {
       setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, is_published: newStatus } : q))
       toast({ title: "STATUS_UPDATED", description: `Quiz is now ${newStatus ? 'PUBLISHED' : 'DRAFT'}.` })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
         <div>
            <h2 className="font-sans font-black text-xl text-white uppercase tracking-tighter flex items-center">
              Targeted Assessments
            </h2>
            <p className="font-mono text-xs text-slate-500 tracking-widest uppercase mt-1">Configure active evaluation parameters</p>
         </div>
         
         <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-none font-mono text-[10px] tracking-widest uppercase bg-emerald-500 hover:bg-emerald-400 text-black border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all">
            <Plus className="w-4 h-4 mr-2" /> CREATE_ASSESSMENT
         </Button>
      </div>

      {quizzes.length === 0 ? (
         <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 text-center bg-[#131313]">
            <BrainCircuit className="w-8 h-8 text-slate-600 mb-4" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">NO_ASSESSMENTS_DETECTED.<br/>AWAITING_NEW_CONSTRUCTS...</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
               <div key={quiz.id} className="group relative bg-[#131313] border border-slate-800 p-6 shadow-sm hover:border-emerald-500/50 transition-colors flex flex-col">
                  
                  {/* Status Indicator Map */}
                  <div className="absolute top-0 right-0 p-4">
                     <span className={`inline-flex items-center px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border ${quiz.is_published ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500 bg-slate-900'} transition-colors`}>
                        {quiz.is_published ? 'PUBLISHED_LIVE' : 'DRAFT_MODE'}
                     </span>
                  </div>

                  <div className="pr-20 mb-6">
                     <h3 className="font-sans font-bold text-xl text-white uppercase group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
                        {quiz.title}
                     </h3>
                     <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center text-slate-400 font-mono text-[10px]"><HelpCircleIcon className="w-3 h-3 mr-1 text-slate-500" /> {quiz.questionsCount} Qs</span>
                        <span className="inline-flex items-center text-slate-400 font-mono text-[10px]"><Clock className="w-3 h-3 mr-1 text-slate-500" /> {quiz.time_limit_minutes ? `${quiz.time_limit_minutes}m` : 'UNLIMITED'}</span>
                     </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-3 gap-1 mb-6 border-t border-b border-slate-800 py-3 bg-[#0a0a0a]/50">
                     <div className="text-center border-r border-slate-800">
                        <div className="text-white font-black font-sans text-xl">{quiz.attemptCount}</div>
                        <div className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">Attempts</div>
                     </div>
                     <div className="text-center border-r border-slate-800">
                        <div className="text-emerald-400 font-black font-sans text-xl">{quiz.avgScorePercent}%</div>
                        <div className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">Avg_Score</div>
                     </div>
                     <div className="text-center">
                        <div className="text-white font-black font-sans text-xl">{quiz.max_attempts || '∞'}</div>
                        <div className="text-slate-500 font-mono text-[9px] uppercase tracking-widest mt-1">Limits</div>
                     </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-auto flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                        <Link href={`/teacher/quizzes/${quiz.id}/edit`}>
                           <Button variant="ghost" className="h-8 rounded-none px-3 font-mono text-[10px] hover:text-emerald-400 text-slate-400">
                              <Edit className="w-3 h-3 mr-1" /> BUILDER
                           </Button>
                        </Link>
                        {quiz.attemptCount > 0 && (
                           <Link href={`/teacher/quizzes/${quiz.id}/results`}>
                              <Button variant="ghost" className="h-8 rounded-none px-3 font-mono text-[10px] hover:text-cyan-400 text-slate-400">
                                 <Activity className="w-3 h-3 mr-1" /> ANALYTICS
                              </Button>
                           </Link>
                        )}
                     </div>

                     <Button 
                        disabled={updatingId === quiz.id}
                        onClick={() => handleTogglePublish(quiz.id, quiz.is_published)}
                        variant="ghost" 
                        className={`h-8 rounded-none px-3 font-mono text-[10px] border ${quiz.is_published ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'}`}
                     >
                        {quiz.is_published ? 'DISENGAGE' : 'LAUNCH'}
                     </Button>
                  </div>

               </div>
            ))}
         </div>
      )}

      <CreateQuizModal 
         isOpen={isCreateModalOpen} 
         onClose={() => setIsCreateModalOpen(false)} 
         classId={classId} 
      />
    </div>
  )
}

function HelpCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  )
}
