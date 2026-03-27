"use client"

import { useState } from "react"
import { createQuizAction } from "@/app/actions/quiz"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CreateQuizModal({ isOpen, onClose, classId }: { isOpen: boolean, onClose: () => void, classId: string }) {
  const [title, setTitle] = useState("")
  const [timeLimit, setTimeLimit] = useState("30")
  const [maxAttempts, setMaxAttempts] = useState("1")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  if (!isOpen) return null

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return toast({ title: "INVALID_PARAMETERS", description: "Assessment Title is required.", variant: "destructive" })
    
    setLoading(true)
    const tLimit = timeLimit ? parseInt(timeLimit) : null
    const mAttempts = maxAttempts ? parseInt(maxAttempts) : 1
    
    const res = await createQuizAction(classId, title, tLimit, mAttempts)
    setLoading(false)

    if (res?.error) {
       toast({ title: "COMPILATION_ERROR", description: res.error, variant: "destructive" })
    } else {
       toast({ title: "ASSESSMENT_INITIALIZED", description: "Configuring assessment nodes." })
       setTitle("")
       onClose()
       if (res.quiz?.id) {
          router.push(`/teacher/quizzes/${res.quiz.id}/edit`)
       }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#131313] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
        
        <div className="p-6 border-b border-slate-800 bg-[#1c1b1b]">
          <h2 className="font-sans font-black text-xl text-white uppercase tracking-tight">INITIALIZE_ASSESSMENT</h2>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-1">Establish evaluation base parameters.</p>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest block">Assessment_Title // string</label>
            <input 
              autoFocus
              disabled={loading}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 font-sans text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors uppercase"
              placeholder="e.g. CYBERNETIC_THEORY_01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Time_Limit (MIN) // int</label>
               <input 
                 type="number"
                 disabled={loading}
                 value={timeLimit}
                 onChange={e => setTimeLimit(e.target.value)}
                 className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 font-sans text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                 placeholder="30"
                 min="0"
               />
             </div>
             <div className="space-y-2">
               <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Max_Attempts // int</label>
               <input 
                 type="number"
                 disabled={loading}
                 value={maxAttempts}
                 onChange={e => setMaxAttempts(e.target.value)}
                 className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 font-sans text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                 placeholder="1"
                 min="1"
               />
             </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              onClick={onClose} 
              disabled={loading} 
              variant="ghost" 
              className="rounded-none font-mono text-[10px] uppercase tracking-widest hover:text-white"
            >
              CANCEL
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              {loading ? 'COMPILING...' : 'LAUNCH_CONSTRUCT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
